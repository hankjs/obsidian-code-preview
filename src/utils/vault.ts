import { CachedMetadata, TFile } from "obsidian";
import * as _path from "path";
import { Page } from "src/obsidian_vue.type";
import { useObsidianStore } from "src/store";

export const cachedRead = async (file: TFile): Promise<Page> => {
  const store = useObsidianStore();
  const { app } = store;
  const { vault, metadataCache } = app;

  const contents = await vault.cachedRead(file);

  return {
    path: file.path,
    contents,
    stat: file.stat,
    metadata: metadataCache.getFileCache(file) as CachedMetadata,
  };
};
