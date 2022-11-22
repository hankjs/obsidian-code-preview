import { Settings } from "src/obsidian_vue.type";
import { list } from "src/utils/file";
import { resolve } from '../utils/path';
import { Alias } from '../obsidian_vue.type';
import { Notice } from "obsidian";
import { APP_NAME } from './../default_settings';
import { watch, filterPathByAlias } from '../utils/file';

class SettingStore {
	settings: Settings;
	aliasFilePathMap = new Map<string, Set<string>>();
	includeFilePath: Set<string> = new Set();

	constructor() {
		this.settings = null as unknown as Settings;
	}

	async init() {
		await this.initIncludeFilePath();
		await this.initAliasFilePath();
	}

	reset(settings: Settings) {
		this.settings = settings;
	}

	async initAliasFilePath() {
		this.aliasFilePathMap.clear();
		const { alias } = this.settings;

		for (const key in alias) {
			const aliasObj = this.getAlias(alias[key]);

			const path = await this.initAliasFilePathByObj(key, aliasObj);
			if (path) {
				const pathSet = this.aliasFilePathMap.get(key);
				const listener = (eventType: string, filename: string) => {
					const { files, folders } = filterPathByAlias(aliasObj, [filename], [filename]);
					if (folders.length > 0 && files.length > 0) {
						pathSet?.add(filename.replace(/\\+/g, "/"));
					}
				};
				this.settings.watchAlias && watch(path, listener);
			}
		}
	}

	async initAliasFilePathByObj(key: string, aliasObj: Alias) {
		if (typeof aliasObj === "string") {
			return;
		}
		try {
			const path = resolve(aliasObj.alias);
			this.aliasFilePathMap.set(
				key,
				new Set(await list({
					paths: [path],
					recurs: true,
					alias: aliasObj,
					replacer(path) {
						return path.replace(`${key}/`, "");
					}
				}))
			);
			return path;
		} catch (error) {
			console.error(error);
			if (error instanceof Error) {
				new Notice(`[${APP_NAME} Alias]: ${aliasObj.alias} not find`);
			} else if (typeof error === "string") {
				new Notice(`[${APP_NAME} Alias]: ${aliasObj.alias} not find`);
			}
		}
	}

	async initIncludeFilePath() {
		try {
			this.includeFilePath = new Set(await list({
				paths: ["/"],
				recurs: true,
				alias: this.settings as unknown as Alias,
			}));
		} catch (error) {
			console.error(error);
		}
	}

	getAlias(alias: Alias) {
		const { include, exclude, includeFile, excludeFile } = this.settings;
		if (typeof alias === "string") {
			return {
				alias,
				include,
				exclude,
				includeFile,
				excludeFile
			};
		}

		return {
			alias: alias.alias,
			include: alias.include ? alias.include : include,
			exclude: alias.exclude ? alias.exclude : exclude,
			includeFile: alias.includeFile ? alias.includeFile : includeFile,
			excludeFile: alias.excludeFile ? alias.excludeFile : excludeFile
		};
	}
}

let store: SettingStore = null as unknown as SettingStore;
export const useSettingStore = () => {
	if (store) {
		return store;
	}

	store = new SettingStore();
	return store;
};
