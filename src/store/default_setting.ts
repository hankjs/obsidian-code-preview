import { Settings } from "src/obsidian_vue.type";
import { list } from "src/utils/file";
import { resolve } from '../utils/path';
import { Alias } from '../obsidian_vue.type';

class SettingStore {
	settings: Settings;
	aliasFilePathMap = new Map<string, string[]>();

	constructor() {
		this.settings = null as any;
	}

	async init() {
		await this.initAliasFilePath();
	}

	reset(settings: Settings) {
		this.settings = settings;
	}

	async initAliasFilePath() {
		this.aliasFilePathMap.clear();
		const { alias } = this.settings;

		for (const k in alias) {
			const aliasObj = this.getAlias(alias[k]);
			const path = resolve(aliasObj.alias);
			this.aliasFilePathMap.set(
				k,
				await list({
					paths: [path],
					recurs: true,
					...aliasObj,
					replacer(path) {
						return path.replace(`${k}/`, "");
					}
				})
			);
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

let store: SettingStore = null as any;
export const useSettingStore = () => {
	if (store) {
		return store;
	}

	store = new SettingStore();
	return store;
};
