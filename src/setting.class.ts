import { Plugin } from "obsidian";
import { SettingsTab } from "./setting/Setting";
import { DEFAULT_SETTINGS } from "./default_settings";
import { ISetting } from "./obsidian_vue.type";
import { useSettingStore, useObsidianStore } from "./store";

export class SettingPlugin extends Plugin implements ISetting {
  settingsTab!: SettingsTab;
  store!: ReturnType<typeof useObsidianStore>;
  settingsStore!: ReturnType<typeof useSettingStore>;

  get settings() {
    return this.settingsStore.settings;
  }

  set settings(newSetting: any) {
    this.settingsStore.reset(newSetting);
  }

  async onload() {
    this.settingsStore = useSettingStore();
    this.store = useObsidianStore(this);

    await this.loadSettings();

    this.settingsTab = new SettingsTab(this, {
      onSettingsChange: async (newSettings) => {
        this.settings = newSettings;
        await this.saveSettings();
      },
    });

    this.addSettingTab(this.settingsTab);
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
