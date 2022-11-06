import { Settings } from "./obsidian_vue.type";

export const APP_NAME =  "Code Preview"

export const DEFAULT_SETTINGS: Settings = {
	highLightColor: "#2d82cc20",
	alias: {
		"code": "${vaultBasePath}/.."
	}
};
