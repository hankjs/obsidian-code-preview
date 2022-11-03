import { TFile } from "obsidian";
import { useObsidianStore } from "src/store";

export function getPathByMarkdownLink(link: string) {
	if (/\[\[.*\]\]/.test(link)) {
		link = link.replace(/\[\[(.*)\]\]/, '$1');
	}

	if (link.startsWith('/')) {
		link = link.slice(1);
	}

	return link;
}

export function fileToLinktext(file: TFile | string, sourcePath: string, omitMdExtension?: boolean) {
	const { app } = useObsidianStore();
	if (typeof file === "string") {
		file = app.vault.getAbstractFileByPath(file) as TFile;
	}
	if (file == null) {
		return "";
	}
	return `[[${app.metadataCache.fileToLinktext(file, sourcePath, omitMdExtension)}]]`;
}
