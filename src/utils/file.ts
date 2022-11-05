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
		if (isString(start)) {
			startIndex = lines.findIndex((line) => line.match(start));
		}
		if (isRegExp(start)) {
			const reg = new RegExp(start.replace(/^\/(.*)\/$/, "$1"));
			startIndex = lines.findIndex((line) => reg.test(line));
		}

		// endIndex
		if (isString(end)) {
			endIndex = lines.findIndex((line) => line.match(end));
		}
		if (isRegExp(end)) {
			const reg = new RegExp(end.replace(/^\/(.*)\/$/, "$1"));
			endIndex = lines.findIndex((line) => reg.test(line));
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
