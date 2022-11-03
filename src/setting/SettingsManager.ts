import update, { Spec } from "immutability-helper";
import { App, Setting } from "obsidian";
import { APP_NAME, DEFAULT_SETTINGS } from "src/default_settings";
import { EspansoPlugin, Settings } from "src/obsidian_vue.type";
import { SettingsManagerConfig } from "./Setting";

export class SettingsManager {
  app: App;
  plugin: EspansoPlugin;
  config: SettingsManagerConfig;
  settings: Settings;
  applyDebounceTimer: number = 0;

  constructor(
    plugin: EspansoPlugin,
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
    containerEl.empty();

    containerEl.createEl("h2", {
      text: `Settings for ${APP_NAME} plugin.`,
    });

    this.uiEspansoSettings(containerEl);
  }

  uiEspansoSettings(containerEl: HTMLElement) {
    containerEl.createEl("h3", { text: "Espanso" });
    containerEl.createEl("p", {
      text: "Configure the relevant parameters used by Espanso.",
    });

    // espansoConfigPath
    new Setting(containerEl)
      .setName("Espanso file directory")
      .setDesc(
        createFragment((frag) => {
          frag.appendText(
            "The Espanso profile directory is used to save yaml files. like: C:\\User\\hank\\AppData\\Roaming\\espanso\\obsidian.yml\n"
          );
          frag.createEl(
            "a",
            {
              text: "About",
              href: "https://espanso.org/docs/configuration/basics/#structure",
            },
            (a) => {
              a.setAttr("target", "_blank");
            }
          );
        })
      )
      .addText((text) => {
        const value = this.getSetting("espansoConfigPath");

        if (value) {
          text.setValue(value as string);
        }

        text.setPlaceholder("espansoConfigPath");

        text.onChange((newValue) => {
          if (newValue) {
            this.applySettingsUpdate({
              espansoConfigPath: {
                $set: newValue,
              },
            });
          } else {
            this.applySettingsUpdate({
              $unset: ["espansoConfigPath"],
            });
          }
        });
      });

    // espansoTags
    new Setting(containerEl)
      .setName("Espanso Tags")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("input tag, use <space> or <return>");
        })
      )
      .addTextArea((text) => {
        const value = this.getSetting("espansoTags") as string[];

        if (value) {
          text.setValue(value.join("\n"));
        }

        text.setPlaceholder("espansoTags");

        text.onChange((newValue) => {
          if (newValue) {
            this.applySettingsUpdate({
              espansoTags: {
                $set: newValue
                  .replace(" #", "\n#")
                  .split("\n")
                  .map((tag) => tag.trim()),
              },
            });
          } else {
            this.applySettingsUpdate({
              $unset: ["espansoTags"],
            });
          }
        });
      });

    // labelStart
    new Setting(containerEl)
      .setName("Label start mark")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("Used to match the beginning of the Label regularly");
        })
      )
      .addText((text) => {
        const value = this.getSetting("labelStart");

        if (value) {
          text.setValue(value as string);
        }

        text.setPlaceholder("labelStart");

        text.onChange((newValue) => {
          if (newValue) {
            this.applySettingsUpdate({
              labelStart: {
                $set: newValue,
              },
            });
          } else {
            this.applySettingsUpdate({
              $unset: ["labelStart"],
            });
          }
        });
      });

    // labelEnd
    new Setting(containerEl)
      .setName("Label end mark")
      .setDesc(
        createFragment((frag) => {
          frag.appendText("Used to match the end of the Label regularly");
        })
      )
      .addText((text) => {
        const value = this.getSetting("labelEnd");

        if (value) {
          text.setValue(value as string);
        }

        text.setPlaceholder("labelEnd");

        text.onChange((newValue) => {
          if (newValue) {
            this.applySettingsUpdate({
              labelEnd: {
                $set: newValue,
              },
            });
          } else {
            this.applySettingsUpdate({
              $unset: ["labelEnd"],
            });
          }
        });
      });
  }
}
