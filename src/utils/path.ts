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
		return _path.resolve(vaultBasePath, path.slice(1));
	}

	const { settings } = useSettingStore();
	const { alias } = settings;
	const aliasKeys = Object.keys(alias);
	let isAlias = false;
	for (let i = 0; i < aliasKeys.length; i++) {
		const key = aliasKeys[i];
		if (path.startsWith(key)) {
			isAlias = true;
			path = path.replace(key, alias[key]);
			break;
		}
	}
	path = path.replace("${vaultBasePath}", vaultBasePath);
	if (isAlias) {
		console.log("_path.normalize(path)", _path.normalize(path));
		return _path.normalize(path);
	}
	if (sourcePath != null) {
		return _path.resolve(vaultBasePath, _path.dirname(sourcePath), path);
	}

	return _path.resolve(vaultBasePath, path);
};

export const extname = (path: string) => _path.extname(path).slice(1);

export const resolveObsidianPath = (path: string, sourcePath: string): string => {
	if (path == null) {
		return "";
	}

	if (path.startsWith("/")) {
		return path.slice(1);
	}

	const store = useObsidianStore();
	const { vaultBasePath } = store;
	const fullPath = resolve(path, sourcePath).replace(vaultBasePath, '').replace(/\\/g, '/').replace(/\/\//g, '/');

	return fullPath.startsWith("/") ? fullPath.slice(1) : fullPath;
};
