import { Settings } from "./obsidian_vue.type";

export const APP_NAME = "Code Preview";

export const DEFAULT_SETTINGS: Settings = {
	watchAlias: true,
	watchCode: true,
	highLightColor: "#2d82cc20",
	include: [],
	exclude: ["node_modules", ".obsidian"],
	includeFile: ["/\\.js$/", "/\\.css$/"],
	excludeFile: [],
	linenumber: true,
	alias: {
		"code": {
			alias: "/../src",
			includeFile: ["/\\.(j|t)s$/"],
		},
		"test": {
			alias: "/../tests",
			includeFile: ["/\\.(j|t)s$/"],
		}
	}
};
