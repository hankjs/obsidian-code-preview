import * as _path from "path";
import { useObsidianStore } from "src/store";
import { useSettingStore } from '../store/default_setting';

export const resolve = (path: string, sourcePath?: string): string => {
	if (path == null) {
		return "";
	}

	const store = useObsidianStore();
	const { vaultBasePath } = store;

	if (path.startsWith("/")) {
		// Has ".." is relative path
		return path.startsWith(vaultBasePath) ? path : vaultBasePath + path;
	}

	const settingStore = useSettingStore();
	const { alias } = settingStore.settings;
	const aliasKeys = Object.keys(alias);
	let isAlias = false;
	for (let i = 0; i < aliasKeys.length; i++) {
		const key = aliasKeys[i];
		if (path.startsWith(key)) {
			isAlias = true;
			path = path.replace(key, settingStore.getAlias(alias[key]).alias);
			return resolve(path, sourcePath);
		}
	}
	path = path.replace("${vaultBasePath}", vaultBasePath);
	if (isAlias) {
		return _path.normalize(path);
	}
	if (sourcePath != null) {
		return `${vaultBasePath}/${_path.dirname(sourcePath)}/${path}`;
	}

	return path.startsWith(vaultBasePath) ? path : `${vaultBasePath}/${path}`;
};

export function relative(path: string, sourcePath?: string) {
	const store = useObsidianStore();
	const { vaultBasePath } = store;

	return _path.relative(vaultBasePath, resolve(path, sourcePath));
}

export const extname = (path: string) => _path.extname(path).slice(1);

export const resolveObsidianPath = (path: string, sourcePath: string): string => {
	if (path == null) {
		return "";
	}

	const store = useObsidianStore();
	const { vaultBasePath } = store;

	const fullPath = resolve(path, sourcePath)
		.replace(vaultBasePath, '')
		.replace(/\\/g, '/').replace(/\/\//g, '/');

	return fullPath.startsWith("/") ? fullPath.slice(1) : fullPath;
};
