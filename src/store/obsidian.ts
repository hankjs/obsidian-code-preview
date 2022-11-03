import { App, fuzzySearch, getAllTags, parseYaml, prepareFuzzySearch, TAbstractFile, TFile } from "obsidian";
import * as path from "path";

import { Page, EspansoPlugin, YamlConfig } from "src/obsidian_vue.type";
import { cachedRead } from "src/utils/vault";
import { resolve, resolveObsidianPath } from "src/utils/path";
import { generateConfigFile } from "src/utils/espanso";
import { useSettingStore } from ".";
import log from "src/utils/log";
import { APP_NAME } from "src/default_settings";
import { parsePreviewYaml, wrapLinkAnnotation } from "src/utils/string";
import { write } from "src/utils/file";
import { getPathByMarkdownLink } from "src/utils/metadataCache";

const searchPreviewAnnotation = prepareFuzzySearch("%%preview %%");

export interface ObsidianState {
	app: App;
	plugin: EspansoPlugin;
	vaultBasePath: string;
	pageMap: Map<string, Page>;
}

class ObsidianStore {
	app: App = null as any;
	plugin: EspansoPlugin = null as any;
	vaultBasePath: string = null as any;
	pageMap: Map<string, Page> = new Map();
	resolveCount = 0;

	constructor(plugin: EspansoPlugin) {
		this.init(plugin);
	}

	init(plugin: EspansoPlugin) {
		if (plugin === this.plugin) {
			return;
		}

		this.plugin = plugin;
		this.app = plugin.app;
		this.vaultBasePath = plugin.app.vault.adapter.basePath;

		plugin.registerEvent(
			this.app.metadataCache.on("resolve", (file: TFile) =>
				this.onMetadataCacheResolve(file)
			)
		);

		plugin.registerEvent(
			this.app.metadataCache.on("resolved", () =>
				this.generateEspansoConfigFile(Object.keys(this.app.metadataCache.resolvedLinks).length)
			)
		);

		plugin.registerEvent(
			this.app.vault.on("delete", (file: TAbstractFile) =>
				this.onVaultDelete(file)
			)
		);

		plugin.registerEvent(
			this.app.vault.on("rename", (file: TAbstractFile, oldPath: string) =>
				this.onVaultRename(file, oldPath)
			)
		);
		console.log(`Obsidian ${APP_NAME} loaded`);
	}

	onVaultDelete(file: TAbstractFile) {
		if (!this.pageMap.has(file.path)) {
			return;
		}
		this.pageMap.delete(file.path);
		this.resolveCount--;
		generateConfigFile();
	}

	onVaultRename(file: TAbstractFile, oldPath: string) {
		if (!this.pageMap.has(file.path)) {
			return;
		}
		this.pageMap.delete(oldPath);
		this.onMetadataCacheResolve(file as TFile);
	}

	async onMetadataCacheResolve(file: TFile) {
		const { settings } = useSettingStore();
		const page = await cachedRead(file);
		let configList = [];
		let label = "";
		try {
			const result = parsePreviewYaml(page.contents, page.path);
			label = result.label;
			configList = result.configList;
		} catch (error) {
			this.addCache(page);
			return
		}
		configList.length > 0 && this.pageMap.set(page.path, page);
		await this.generatePreviewLinks(page, configList);

		// check tags need espanso
		const tags = getAllTags(page.metadata);
		if (!tags?.some((tag) => settings.espansoTags.includes(tag))) {
			this.addCache(page);
			return;
		}

		const [firstConfig] = configList;
		if (!firstConfig) {
			this.addCache(page);
			return;
		}

		// init page snippet property
		page.enableEspanso = !!firstConfig.trigger;
		page.snippetLabel = label;
		page.snippetTrigger = firstConfig.trigger;
		page.snippetPath = resolve(firstConfig.path || firstConfig.link, page.path);

		this.addCache(page);
	}

	addCache(page: Page) {
		if (this.pageMap.has(page.path)) {
			return;
		}

		this.resolveCount++;
	}

	generateEspansoConfigFile(resolveLength: number) {
		if (resolveLength !== this.resolveCount) {
			window.requestAnimationFrame(() => this.generateEspansoConfigFile(resolveLength));
			return;
		}

		generateConfigFile();
	}

	searchPreviewAnnotations(contents: string) {
		const result = searchPreviewAnnotation(contents);
		let links: string[] = [];
		if (result == null) {
			return { links };
		}

		const { matches } = result;
		const [[annotationStart, linksStart], [linksEnd, annotationEnd]] = matches;
		if (linksStart == null || linksEnd == null) {
			return { links, annotationStart, annotationEnd };
		}

		const mdLinks = contents.slice(linksStart, linksEnd).match(/\[\[([^\[\]]*)\]\]/g);
		links = mdLinks?.map(md => md.replace(/\[\[([^\[\]]*)\]\]/, "$1")) as string[];

		return {
			annotationStart,
			annotationEnd,
			linksStart,
			linksEnd,
			links
		};
	}

	async generatePreviewLinks(page: Page, configList: YamlConfig[]) {
		const { contents } = page;

		let { links, annotationStart, annotationEnd } = this.searchPreviewAnnotations(contents);
		if (!configList || configList.length === 0) {
			if (this.pageMap.has(page.path) && annotationStart != null) {
				await write(page.path, `${contents.slice(0, annotationStart)}${contents.slice(annotationEnd)}`);
				this.pageMap.delete(page.path);
			}
			return;
		}

		const linkConfigList = configList.filter(config => Reflect.has(config, "link"));

		if (linkConfigList.length === 0) {
			return;
		}

		const codeBlockLinks = linkConfigList.map(config => resolveObsidianPath(config.link as string, page.path));
		const codeBlockLinksSet = new Set([...codeBlockLinks]);
		const concatSet = new Set([...links, ...codeBlockLinksSet]);

		if (links.length === concatSet.size && links.length === codeBlockLinksSet.size) {
			return;
		}

		const linkAnnotation = wrapLinkAnnotation(
			[...codeBlockLinksSet].map(getPathByMarkdownLink)
				.map((link) => `[[${link}]]`)
				.join('')
		);

		const addLinksContents = annotationStart == null ? `${contents}\n${linkAnnotation}` :
			`${contents.slice(0, annotationStart)}${linkAnnotation}${contents.slice(annotationEnd)}`;
		await write(page.path, addLinksContents);
	} // end generatePreviewLinks

}

let store: ObsidianStore = null as any;
export const useObsidianStore = (plugin?: EspansoPlugin) => {

	if (store) {
		return store;
	}

	if (!plugin) {
		log.error("Init Failed");
		return store;
	}

	store = new ObsidianStore(plugin);
	return store;
};
