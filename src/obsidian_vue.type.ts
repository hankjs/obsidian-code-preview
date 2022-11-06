import { CachedMetadata, FileStats, Plugin } from "obsidian";

export interface Settings {
	highLightColor: string;
	alias: Record<string, string>;
}

export interface YamlConfig {
	/** preview file path and generate [[LINK to link file]] */
	link?: string;
	/** preview file path */
	path?: string;
	start?: number | string;
	end?: number | string;
	trigger?: string;
}

export interface Page {
	path: string;
	contents: string;
	metadata: CachedMetadata;
	stat: FileStats;
	enableEspanso?: boolean;
	snippetPath?: string;
	snippetTrigger?: string;
	snippetLabel?: string;
}

export interface ISetting {
	settings: Settings;

	loadSettings: () => any;
	saveSettings: () => any;
}

export type CodePreviewPlugin = Plugin & ISetting;
