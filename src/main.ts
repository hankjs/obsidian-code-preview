import {
	Component,
	MarkdownPostProcessorContext,
	MarkdownRenderer,
	parseYaml,
} from "obsidian";
import { wrapCodeBlock } from "./utils/string";
import { extname, resolve } from "./utils/path";
import { readFileSync, selectFileSync } from "./utils/file";
import { SettingPlugin } from "./setting.class";

export default class extends SettingPlugin {
	async onload() {
		super.onload();

		this.registerPriorityCodeblockPostProcessor(
			"preview",
			-100,
			async (source: string, el, ctx) =>
				this.preview(source, el, ctx, ctx.sourcePath)
		);
	}

	onunload() {
		super.onunload();
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
		let registered = this.registerMarkdownCodeBlockProcessor(
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
		};

		try {
			const codeSetting = parseYaml(source);
			const path = codeSetting?.path || codeSetting?.link;
			const filePath = resolve(path, sourcePath);

			result.language =
				codeSetting?.language || codeSetting?.lang || extname(path);
			result.code = await selectFileSync(filePath, codeSetting.start, codeSetting.end);
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

		const preStyles = getComputedStyle(pre);
		const codeStyles = getComputedStyle(codeEl);
		const line_number = createEl('span', {
			cls: 'code-block-line_num-wrap',
			attr: {
				style: `top: ${preStyles.paddingTop}; line-height: ${codeStyles.lineHeight}; font-size: ${codeStyles.fontSize};`
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
		const preStyles = getComputedStyle(pre);
		const codeStyles = getComputedStyle(codeEl);
		let highLightWrap = createEl("div", {
			attr: {
				style: `top: ${preStyles.paddingTop}; line-height: ${codeStyles.lineHeight}; font-size: ${codeStyles.fontSize};`
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

	analyzeHighLightLines(lines: string[], source: string) {
		source = source.replace(/\s*/g, ""); // 去除字符串中所有空格
		const result = new Map<number, boolean>();

		let strs = source.split(",");
		strs.forEach(it => {
			if (/\w+-\w+/.test(it)) { // 如果匹配 1-3 这样的格式，依次添加数字
				let left = Number(it.split('-')[0]);
				let right = Number(it.split('-')[1]);
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
		const { code, language, lines, highlight } = await this.code(source, sourcePath);
		await MarkdownRenderer.renderMarkdown(
			wrapCodeBlock(language, code),
			el,
			sourcePath,
			component as Component
		);
		const pre = el.querySelector("pre");
		if (!pre) {
			return;
		}
		this.addLineNumber(pre, el, lines.length);

		if (highlight) {
			this.addLineHighLight(
				pre,
				this.analyzeHighLightLines(lines, highlight),
				lines.length
			);
		}
	}
}
