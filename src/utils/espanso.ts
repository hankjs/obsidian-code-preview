import { writeFileSync } from "fs";
import diff from "microdiff";
import { Notice, parseYaml, stringifyYaml } from "obsidian";

import { Page } from "src/obsidian_vue.type";
import { readFileSync } from "./file";
import { useObsidianStore, useSettingStore } from "src/store";
import log from "./log";
import { debounce, sortBy } from "src/utils/lodash";

export interface TriggerVar {
	name: string;
	type: string;
	params: {
		cmd: string;
		shell: string;
		trim: boolean;
	};
}

export interface Matches {
	trigger: string;
	replace: string;
	label: string;
	ctime: number;
	vars: TriggerVar[];
}

export function getPowershellMatches(data: Required<Page>): Matches {
	return {
		trigger: data.snippetTrigger,
		replace: "{{snippet}}",
		label: data.snippetLabel,
		ctime: data.stat.ctime,
		vars: [
			{
				name: "snippet",
				type: "shell",
				params: {
					cmd: `cat ${data.snippetPath}`,
					shell: "powershell",
					trim: false,
				},
			},
		],
	};
}

export const generateConfigFile = debounce(async () => {
	const { espansoConfigFilePath } = useSettingStore();
	if (!espansoConfigFilePath) {
		new Notice(`Please set Espanso file directory`);
		return;
	}

	// Local old config
	const oldConfig = parseYaml(await readConfigFile());

	// New config
	const store = useObsidianStore();
	const { pageMap } = store;
	const pageList = [...pageMap.values()] as Required<Page>[];
	const matches = pageList.filter(page => page.enableEspanso).map(getPowershellMatches);

	// Diff
	const changes = diff(
		matches2Obj(oldConfig.matches || []),
		matches2Obj(matches)
	);

	if (!changes || changes == null || changes.length === 0) {
		return;
	}

	log.table(changes);

	const config = stringifyYaml({
		matches,
	});

	writeFileSync(
		espansoConfigFilePath,
		`# generate by Obsidian Code Preview Plugin

${config}`
	);
}, 1000);

export function matches2Obj(list: Matches[]): Record<string, Matches> {
	const res: Record<string, Matches> = {};

	list.forEach(
		(matches) => (res[`${matches.label}:${matches.ctime}`] = matches)
	);

	return res;
}

export async function readConfigFile() {
	const { espansoConfigFilePath } = useSettingStore();
	return readFileSync(espansoConfigFilePath);
}
