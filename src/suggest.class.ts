import { Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, prepareFuzzySearch, SearchResult, TFile } from "obsidian";
import { useSettingStore } from "./store";
import { Alias } from './obsidian_vue.type';

interface PathSearch {
	match: SearchResult;
	item: string;
}

function sort(results: PathSearch[]) {
	results.sort((function (e, t) {
		return t.match.score - e.match.score;
	}));
}

enum SuggestType {
	path = "path"
}

export class Suggest extends EditorSuggest<PathSearch> {
	context!: EditorSuggestContext & {
		aliasKey: string;
	};

	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		const lineText = editor.getLine(cursor.line);

		const pathMatches = lineText.match(/^(>|\s)*path:\s*(.*)/);
		if (pathMatches) {
			return this.onPathTrigger(cursor, pathMatches);
		}

		return null;
	}

	onPathTrigger(cursor: EditorPosition, matches: RegExpMatchArray) {
		const [origin, , query = ""] = matches;

		console.log(query);

		return {
			start: {
				line: cursor.line,
				ch: origin.length - query.length
			},
			end: {
				line: cursor.line,
				ch: origin.length
			},
			query,
			type: SuggestType.path
		};
	}

	getSuggestions(context: EditorSuggestContext): PathSearch[] | Promise<PathSearch[]> {
		let result: PathSearch[] = [];
		const aliasKeys = this.getAliasSuggestions(context);
		if (aliasKeys.length > 0) {
			result = result.concat(aliasKeys);
		}

		const aliasPath = this.getAliasPathSuggestions(context);
		if (aliasPath.length > 0) {
			result = result.concat(aliasPath);
		}

		sort(result);

		return result;
	}

	isSuggestEqQuery(suggests: PathSearch[], query: string) {
		if (suggests.length !== 1) {
			return false;
		}
		const [{ item }] = suggests;

		return (item === query);
	}

	getAliasSuggestions(context: EditorSuggestContext) {
		const { settings: { alias }, includeFilePath } = useSettingStore();
		const aliasKeys = Object.keys(alias);

		const result: PathSearch[] = [];
		const fuzzySearch = prepareFuzzySearch(context.query);
		for (const item of aliasKeys) {
			const match = fuzzySearch(item);
			match && result.push({
				match,
				item
			});
		}

		if (includeFilePath.size > 0) {
			includeFilePath.forEach(item => {
				const match = fuzzySearch(item);
				match && result.push({
					match,
					item
				});
			});
		}

		if (this.isSuggestEqQuery(result, context.query)) {
			return [];
		}

		return result;
	}

	getAliasPathSuggestions(context: EditorSuggestContext) {
		const { settings: { alias }, aliasFilePathMap } = useSettingStore();
		const aliasKeys = Object.keys(alias);
		const aliasKey = aliasKeys.find(key => {
			const startsWithReg = new RegExp(`^(${key}|${key}\\/|${key}\\\\)`);
			return startsWithReg.test(context.query);
		});
		if (!aliasKey) {
			return [];
		}
		const files = aliasFilePathMap.get(aliasKey);
		const paths = new Set<string>(files);

		if (paths.size === 0) {
			return [];
		}

		const result = [];

		const query: string = context.query
			.replace(aliasKey, "")
			.replace(/^\\/, "")
			.replace(/^\//, "");
		const fuzzySearch = prepareFuzzySearch(query);
		for (let item of paths) {
			item = this.clearAliasPath(alias[aliasKey], item);
			const match = fuzzySearch(item);
			match && result.push({
				match,
				item
			});
		}

		if (this.isSuggestEqQuery(result, query)) {
			return [];
		}

		this.context.aliasKey = aliasKey;
		return result;
	}

	clearAliasPath(alias: Alias, path: string) {
		if (typeof alias !== "string") {
			alias = alias.alias;
		}

		const aliasPath = alias
			.replace(/^\//, "")
			.replace(/^\\/, "")
			.replace(/^\.\.\//, "")
			.replace(/^\.\.\\/, "");

		return path.replace(`${aliasPath}/`, "");
	}

	renderSuggestion(value: PathSearch, el: HTMLElement): void {
		el.setText(value.item);
	}

	selectSuggestion(value: PathSearch, evt: MouseEvent | KeyboardEvent): void {
		if (evt instanceof KeyboardEvent && evt.key.toUpperCase() !== "ENTER") {
			return;
		}

		// click or enter
		const { editor, start, end, aliasKey: prefix, query } = this.context;
		const replacement = !prefix ? value.item : `${prefix}/${value.item}`;
		editor.replaceRange(
			replacement,
			start, end);
		editor.setCursor(end.line, end.ch + replacement.length - query.length);
		this.close();
	}

	close() {
		super.close();
	}
}
