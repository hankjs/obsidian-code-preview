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
		let code = '';
		let language = '';
		try {
			const codeSetting = parseYaml(source);
			console.log("codeSetting", codeSetting);
			const path = codeSetting?.path || codeSetting?.link;
			const filePath = resolve(path, sourcePath);

			language =
				codeSetting?.language || codeSetting?.lang || extname(path);
			code = await selectFileSync(filePath, codeSetting.start, codeSetting.end);
		} catch (error) {
			if (error instanceof Error) {
				code = error.message;
			} else if (typeof error === "string") {
				code = error;
			} else {
				code = error as string;
			}
		}

		return {
			code,
			language
		};
	}

	public async preview(
		source: string,
		el: HTMLElement,
		component: Component | MarkdownPostProcessorContext,
		sourcePath: string
	) {
		const { code, language } = await this.code(source, sourcePath);
		MarkdownRenderer.renderMarkdown(
			wrapCodeBlock(language, code),
			el,
			sourcePath,
			component as Component
		);
	}
}
