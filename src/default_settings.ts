import { Settings } from "./obsidian_vue.type";

export const APP_NAME =  "Code Preview"

export const DEFAULT_SETTINGS: Settings = {
  espansoTags: ["#snippets"],
  espansoConfigPath: undefined as any,

  labelStart: "# Overview",
  labelEnd: "(```preview)|(---)|(\\s#)",
};
