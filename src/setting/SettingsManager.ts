import update, { Spec } from "immutability-helper";
import { App, Setting } from "obsidian";
import { APP_NAME, DEFAULT_SETTINGS } from "src/default_settings";
import { CodePreviewPlugin, Settings } from "src/obsidian_vue.type";
import { SettingsManagerConfig } from "./Setting";

export class SettingsManager {
	app: App;
	plugin: CodePreviewPlugin;
	config: SettingsManagerConfig;
	settings: Settings;
	applyDebounceTimer: number = 0;

	constructor(
		plugin: CodePreviewPlugin,
		config: SettingsManagerConfig,
		settings: Settings
	) {
		this.app = plugin.app;
		this.plugin = plugin;
		this.config = config;
		this.settings = settings;
	}

	applySettingsUpdate(spec: Spec<Settings>) {
		clearTimeout(this.applyDebounceTimer);

		this.applyDebounceTimer = window.setTimeout(() => {
			this.settings = update(this.settings, spec);
			this.config.onSettingsChange(this.settings);
		}, 200);
	}

	getSetting(key: keyof Settings) {
		return this.settings[key];
	}

	getDefaultSetting(key: keyof Settings) {
		return DEFAULT_SETTINGS[key];
	}

	constructUI(containerEl: HTMLElement): void {
		const { settings } = this.plugin;
		containerEl.empty();

		containerEl.createEl("h3", {
			text: "Code Preview",
		});

		new Setting(containerEl)
			.setName("Linenumber")
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.linenumber)
					.onChange((value) => {
						this.plugin.settings.linenumber = value;
						this.plugin.saveSettings();
					}));


		new Setting(containerEl)
			.setName("highLightColor")
			.addText((text) => {
				text
					.setPlaceholder(DEFAULT_SETTINGS.highLightColor)
					.setValue(settings.highLightColor || "")
					.onChange(async (value) => {
						try {
							settings.highLightColor = value;
							await this.plugin.saveSettings();
						} catch (e) {
							return false;
						}
					});
			});

		new Setting(containerEl)
			.setName("Path alias")
			.setDesc("map path")
			.addTextArea((text) => {
				text
					.setPlaceholder(JSON.stringify(DEFAULT_SETTINGS.alias, null, 2))
					.setValue(JSON.stringify(settings.alias, null, 2) || "")
					.onChange(async (value) => {
						try {
							const newValue = JSON.parse(value);
							settings.alias = newValue;
							await this.plugin.saveSettings();
						} catch (e) {
							return false;
						}
					});
				text.inputEl.rows = 10;
				text.inputEl.cols = 60;
			});


		new Setting(containerEl)
			.setName("include")
			.addTextArea((text) => {
				text
					.setPlaceholder(JSON.stringify(DEFAULT_SETTINGS.include))
					.setValue(JSON.stringify(settings.include) || "")
					.onChange(async (value) => {
						try {
							const newValue = JSON.parse(value);
							settings.include = newValue;
							await this.plugin.saveSettings();
						} catch (e) {
							return false;
						}
					});
				text.inputEl.rows = 1;
				text.inputEl.cols = 60;
			});


		new Setting(containerEl)
			.setName("exclude")
			.addTextArea((text) => {
				text
					.setPlaceholder(JSON.stringify(DEFAULT_SETTINGS.exclude))
					.setValue(JSON.stringify(settings.exclude) || "")
					.onChange(async (value) => {
						try {
							const newValue = JSON.parse(value);
							settings.exclude = newValue;
							await this.plugin.saveSettings();
						} catch (e) {
							return false;
						}
					});
				text.inputEl.rows = 1;
				text.inputEl.cols = 60;
			});

		new Setting(containerEl)
			.setName("includeFile")
			.addTextArea((text) => {
				text
					.setPlaceholder(JSON.stringify(DEFAULT_SETTINGS.includeFile))
					.setValue(JSON.stringify(settings.includeFile) || "")
					.onChange(async (value) => {
						try {
							const newValue = JSON.parse(value);
							settings.includeFile = newValue;
							await this.plugin.saveSettings();
						} catch (e) {
							return false;
						}
					});
				text.inputEl.rows = 1;
				text.inputEl.cols = 60;
			});

		new Setting(containerEl)
			.setName("excludeFile")
			.addTextArea((text) => {
				text
					.setPlaceholder(JSON.stringify(DEFAULT_SETTINGS.excludeFile))
					.setValue(JSON.stringify(settings.excludeFile) || "")
					.onChange(async (value) => {
						try {
							const newValue = JSON.parse(value);
							settings.excludeFile = newValue;
							await this.plugin.saveSettings();
						} catch (e) {
							return false;
						}
					});
				text.inputEl.rows = 1;
				text.inputEl.cols = 60;
			});
	}

}
