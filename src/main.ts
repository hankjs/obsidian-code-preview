import {
	Component,
	FileView,
	MarkdownPostProcessorContext,
	MarkdownRenderer,
	parseYaml,
	WorkspaceLeaf,
} from "obsidian";
import { wrapCodeBlock } from "./utils/string";
import { extname, resolve } from "./utils/path";
import { selectFileSync, unwatchFile, watchFile } from './utils/file';
import { SettingPlugin } from "./setting.class";
import { Suggest } from './suggest.class';

export default class CodePreviewPlugin extends SettingPlugin {
	suggest!: Suggest;
	style = {
		top: "8px",
		lineHeight: "21px",
		fontSize: "14px"
	};

	watchFileMap = new WeakMap<WorkspaceLeaf, Record<string, Map<HTMLElement, (() => void)[]>>>();

	async onload() {
		super.onload();
		this.app.workspace.onLayoutReady(() => this.initCss());
		this.registerEvent(this.app.workspace.on("resize", () => this.initCss()));

		this.registerPriorityCodeblockPostProcessor(
			"preview",
			-100,
			async (source: string, el, ctx) =>
				this.preview(source, el, ctx, ctx.sourcePath)
		);

		this.suggest = new Suggest(this.app);
		this.registerEditorSuggest(this.suggest);
	}

	onunload() {
		super.onunload();
	}

	initCss() {
		const out = createDiv({
			cls: "markdown-rendered markdown-source-view",
			attr: {
				style: "position: absolute; top: 0; left: -999999px;"
			}
		});
		const pre = createEl("pre", {
			"cls": "language-code-preview-plugin-tmp",
		});
		const code = createEl("code", {
			"cls": "language-css is-loaded"
		});
		out.appendChild(pre);
		pre.appendChild(code);
		document.body.appendChild(out);

		const preStyles = getComputedStyle(pre);
		const codeStyles = getComputedStyle(code);
		this.style = {
			top: preStyles.paddingTop,
			lineHeight: codeStyles.lineHeight,
			fontSize: codeStyles.fontSize
		};
		out.remove();
	}

	/** Register a markdown codeblock post processor with the given priority. */
	public registerPriorityCodeblockPostProcessor(
		language: string,
		priority: number,
		processor: (
			source: string,
			el: HTMLElement,
			ctx: MarkdownPostProcessorContext
		) => Promise<void>
	) {
		const registered = this.registerMarkdownCodeBlockProcessor(
			language,
			processor
		);
		registered.sortOrder = priority;
	}

	/**
	 * code
	 */
	public async code(source: string, sourcePath?: string) {
		const result = {
			code: "",
			language: "",
			highlight: "",
			lines: [] as string[],
			filePath: "",
			linenumber: this.settings.linenumber
		};

		try {
			const codeSetting = parseYaml(source);
			const path = codeSetting?.path || codeSetting?.link;
			const filePath = resolve(path, sourcePath);

			result.linenumber = codeSetting.linenumber == null ? result.linenumber : codeSetting.linenumber;

			result.language =
				codeSetting?.language || codeSetting?.lang || extname(path);
			result.code = await selectFileSync(filePath, codeSetting.start, codeSetting.end);
			if (!result.code) {
				if (codeSetting.start || codeSetting.end) {
					result.code = `File: ${filePath} not match start or end`;
				} else {
					result.code = `File: ${filePath} not created or empty.`;
				}
				return result;
			}
			result.filePath = filePath;
			result.highlight = String(codeSetting.highlight);
			result.lines = result.code.split("\n");
		} catch (error) {
			if (error instanceof Error) {
				result.code = error.message;
			} else if (typeof error === "string") {
				result.code = error;
			} else {
				result.code = error as string;
			}
		}

		return result;
	}


	addLineNumber(pre: HTMLElement, div: HTMLElement, lineSize: number) {
		div.classList.add('code-block-wrap');
		const codeEl = pre.querySelector("code");
		if (!codeEl) {
			return;
		}

		const { top, lineHeight, fontSize } = this.style;
		const line_number = createEl('span', {
			cls: 'code-block-line_num-wrap',
			attr: {
				style: `top: ${top}; line-height: ${lineHeight}; font-size: ${fontSize};`
			}
		});

		Array.from({ length: lineSize }, (v, k) => k).forEach(i => {
			const singleLine = createEl('span', 'code-block-line_num');
			line_number.appendChild(singleLine);
		});

		pre.appendChild(line_number);
		pre.classList.add('code-block-pre__has-line_num');
	}

	addLineHighLight(pre: HTMLElement, highLightLines: Map<number, boolean>, lineSize: number) {
		const codeEl = pre.querySelector("code");
		if (!codeEl) {
			return;
		}

		const { top, lineHeight, fontSize } = this.style;
		const highLightWrap = createEl("div", {
			attr: {
				style: `top: ${top}; line-height: ${lineHeight}; font-size: ${fontSize};`
			}
		});
		highLightWrap.className = "code-block-highlight-wrap";
		for (let i = 0; i < lineSize; i++) {
			const singleLine = createEl("span", 'code-block-highlight');
			if (highLightLines.get(i + 1)) {
				singleLine.style.backgroundColor = this.settings.highLightColor || "#2d82cc20";
			}
			highLightWrap.appendChild(singleLine);
		}

		pre.appendChild(highLightWrap);
	}

	analyzeHighLightLines(lines: string[], source: string | string[]) {
		const result = new Map<number, boolean>();

		const strs = typeof source !== "string" ? source : source
			.replace(/\s*/g, "") // 去除字符串中所有空格
			.split(",");
		strs.forEach(it => {
			if (/\d+-\d+/.test(it)) { // 如果匹配 1-3 这样的格式，依次添加数字
				const left = Number(it.split('-')[0]);
				const right = Number(it.split('-')[1]);
				for (let i = left; i <= right; i++) {
					result.set(i, true);
				}
			} else if (/^\/(.*)\/$/.test(it)) {
				// RegExp
				const reg = new RegExp(it.replace(/^\/(.*)\/$/, "$1"));
				lines.forEach((line, i) => {
					if (reg.test(line)) {
						result.set(i + 1, true);
					}
				});
			} else if (/[^0-9]/.test(it)) {
				// Plain text
				lines.forEach((line, i) => {
					if (line.indexOf(it) > -1) {
						result.set(i + 1, true);
					}
				});
			} else {
				result.set(Number(it), true);
			}
		});

		return result;
	}

	public async preview(
		source: string,
		el: HTMLElement,
		component: Component | MarkdownPostProcessorContext,
		sourcePath: string
	) {
		const { containerEl } = component as unknown as { containerEl: HTMLElement; };
		this.removeWatchByEl(containerEl, el, sourcePath);

		const render = async () => {
			el.empty();
			const { code, language, lines, highlight, filePath, linenumber } = await this.code(source, sourcePath);
			await MarkdownRenderer.renderMarkdown(
				wrapCodeBlock(language, code),
				el,
				sourcePath,
				component as Component
			);
			const pre = el.querySelector("pre");
			if (!pre) {
				return filePath;
			}
			linenumber && this.addLineNumber(pre, el, lines.length);

			highlight &&
				this.addLineHighLight(
					pre,
					this.analyzeHighLightLines(lines, highlight),
					lines.length
				);

			return filePath;
		}; // end render

		const filename = await render();
		this.settings.watchCode && this.addWatch(containerEl, el, sourcePath, filename, render);
	}

	addWatch(containerEl: HTMLElement, el: HTMLElement, sourcePath: string, filename: string, handler: () => void) {
		const leaves = this.app.workspace.getLeavesOfType("markdown");
		const renderLeaf = leaves.find(leaf => leaf.view.containerEl.querySelector(".view-content") === containerEl);
		if (!renderLeaf) {
			return;
		}
		const listener = () => {
			if (!this.settings.watchCode) {
				this.removeWatch(renderLeaf, el, sourcePath);
				return;
			}
			handler();
		};

		watchFile(filename, listener);

		let map = this.watchFileMap.get(renderLeaf);
		if (!map) {
			this.watchFileMap.set(renderLeaf, map = {});
		}
		let elMap = map[sourcePath];
		if (!elMap) {
			map[sourcePath] = (elMap = new Map());
		}
		let unwatch = elMap.get(el);
		if (!unwatch) {
			elMap.set(el, (unwatch = []));
		}
		unwatch.push(() => unwatchFile(filename, listener));

		this.registerEvent(
			this.app.workspace.on("layout-change", () => {
				const leaves = this.app.workspace.getLeavesOfType("markdown");
				const hasLeaf = leaves.some(l => l === renderLeaf);
				if (!this.settings.watchCode || !hasLeaf || (renderLeaf.view as FileView).file.path !== sourcePath) {
					return this.removeWatch(renderLeaf, el, sourcePath);
				}
			})

		);
	}

	removeWatchByEl(containerEl: HTMLElement, el: HTMLElement, sourcePath: string) {
		const leaves = this.app.workspace.getLeavesOfType("markdown");
		const renderLeaf = leaves.find(leaf => leaf.view.containerEl.querySelector(".view-content") === containerEl);
		if (!renderLeaf) {
			return;
		}
		this.removeWatch(renderLeaf, el, sourcePath);
	}

	removeWatch(leaf: WorkspaceLeaf, el: HTMLElement, sourcePath: string, clearOther = true) {
		const map = this.watchFileMap.get(leaf);
		if (!map) {
			return;
		}
		const elMap = map[sourcePath];
		if (!elMap) {
			return;
		}

		const blocks = Array.from(leaf.view.containerEl.querySelectorAll(".block-language-preview"));

		const clear = (el: HTMLElement) => {
			let unwatch = elMap.get(el);
			if (!unwatch) {
				elMap.set(el, (unwatch = []));
			}

			elMap.delete(el);
			unwatch.forEach(fn => fn());
		};

		blocks.forEach(block => {
			if (block !== el) {
				return;
			}

			clear(el);
		});

		if (clearOther) {
			const watchEls: HTMLElement[] = [];
			for (const k of elMap.keys()) {
				watchEls.push(k);
			}
			watchEls.forEach((el) => {
				if (blocks.includes(el)) {
					return;
				}
				clear(el);
			});
		}

	}
}
