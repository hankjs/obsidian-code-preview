import { useSettingStore } from "src/store";
import { isString } from "./lodash";
import * as path from "path";
import { parseYaml } from "obsidian";
import { resolve } from "./path";
import { stat } from "./file";

export const codeBlock = "```";

export const wrapCodeBlock = (
	language: string,
	source: string
) => `${codeBlock} ${language}
${source}
${codeBlock}`;

export const wrapLinkAnnotation = (links: string) => `%%preview${links}%%`;

export function trimPreviewWrap(contents: string) {
	if (!isString(contents)) {
		return "";
	}
	return contents.replace(/(```preview)|(```)/g, "");
}


export function parsePreviewYaml(contents: string, pagePath: string) {
	const { settings } = useSettingStore();
	const previewBlockList = contents.match(/```preview(.|\s)*?```/g) as string[];
	if (!previewBlockList || previewBlockList.length === 0) {
		return [];
	}

	const configList = previewBlockList.map(source => parseYaml(trimPreviewWrap(source)))
		.filter(config => {
			try {
				const fileStat = stat(resolve(config.path || config.link, pagePath));
				return true;
			} catch (error) {
				return false;
			}
		});

	return configList;
}
