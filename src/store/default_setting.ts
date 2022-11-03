import { EspansoPlugin, Settings } from "src/obsidian_vue.type";
import log from "src/utils/log";

class SettingStore {
	settings: Settings;

	constructor() {
		this.settings = null as any;
	}

	get espansoConfigFilePath(): string {
		if (!this.settings) {
			log.error("Initialization did not complete");
			return "";
		}

		return this.settings.espansoConfigPath;
	}

	reset(settings: Settings) {
		this.settings = settings;
	}
}

let store: SettingStore = null as any
export const useSettingStore = () => {
	if (store) {
		return store
	}

	store = new SettingStore()
	return store
};
