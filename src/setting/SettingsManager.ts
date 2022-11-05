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
      .setName("Path alias")
      .setDesc("map string to string")
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
        text.inputEl.rows = 32;
        text.inputEl.cols = 60;
      });
  }

}
