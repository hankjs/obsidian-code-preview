import { PluginSettingTab } from "obsidian";
import { EspansoPlugin, Settings } from "src/obsidian_vue.type";
import { SettingsManager } from "./SettingsManager";

export interface SettingsManagerConfig {
  onSettingsChange: (newSettings: Settings) => void;
}

export class SettingsTab extends PluginSettingTab {
  plugin: EspansoPlugin;
  settingsManager: SettingsManager;

  constructor(plugin: EspansoPlugin, config: SettingsManagerConfig) {
    super(plugin.app, plugin);
    this.plugin = plugin;
    this.settingsManager = new SettingsManager(plugin, config, plugin.settings);
  }

  display() {
    const { containerEl } = this;

    containerEl.empty();

    this.settingsManager.constructUI(containerEl);
  }
}
