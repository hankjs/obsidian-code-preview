import * as fs from "fs";
import { DataWriteOptions } from "obsidian";
import { useObsidianStore } from "src/store";
import { isNumber, isRegExp, isString } from "./lodash";

export const readFileSync = (
	path: string,
	options:
		| BufferEncoding
		| { encoding?: BufferEncoding; flag?: string; } = "utf8"
) =>
	new Promise<string>(async (resolve, reject) => {
		try {
			const data = fs.readFileSync(path, options);
			resolve(data as string);
		} catch (err: unknown) {
			reject(err);
		}
	});

export const selectFileSync = async (path: string, start: number | string | RegExp = 1, end?: number | string | RegExp) => {
	try {
		const content = await readFileSync(path);
		const lines = content.split("\n");
		let ret = lines;
		let startIndex = isNumber(start) ? start - 1 : 0;
		let endIndex = isNumber(end) ? end - 1 : lines.length - 2;
		if (isString(start) || isRegExp(start)) {
			const reg = start instanceof RegExp ? start : new RegExp(start);
			startIndex = lines.findIndex((line) => reg.test(line));
		}
		if (isString(end) || isRegExp(end)) {
			const reg = end instanceof RegExp ? end : new RegExp(end);
			endIndex = lines.findIndex((line, i) => i > startIndex && reg.test(line));
		}
		return ret.slice(startIndex, endIndex + 1).join("\n");
	} catch (error) {
		return error as string;
	}
};

export const write = async (path: string, contents: string, options?: DataWriteOptions) => {
	const { app } = useObsidianStore();
	return await app.vault.adapter.write(path, contents, options)
};

export const stat = (path: string) => fs.statSync(path)
