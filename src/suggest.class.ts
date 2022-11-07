import { Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, prepareFuzzySearch, SearchResult, TFile } from "obsidian";
import { useSettingStore } from "./store";

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

		const pathMatches = lineText.match(/^\s*path:\s*(.*)/);
		if (pathMatches) {
			this.onPathTrigger(cursor, pathMatches);
		}

		return null;
	}

	onPathTrigger(cursor: EditorPosition, matches: RegExpMatchArray) {
		const [origin, query] = matches;

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
		const { settings: { alias } } = useSettingStore();
		const aliasKeys = Object.keys(alias);

		let result: PathSearch[] = [];
		const fuzzySearch = prepareFuzzySearch(context.query);
		for (let item of aliasKeys) {
			const match = fuzzySearch(item);
			match && result.push({
				match,
				item
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
		const paths = new Set<string>();
		const files = aliasFilePathMap.get(aliasKey);
		files?.forEach((f) => paths.add(f));

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

	renderSuggestion(value: PathSearch, el: HTMLElement): void {
		el.setText(value.item);
	}

	selectSuggestion(value: PathSearch, evt: MouseEvent | KeyboardEvent): void {
		if (evt instanceof KeyboardEvent && evt.key.toUpperCase() !== "ENTER") {
			return;
		}

		// click or enter
		const { editor, start, end, aliasKey: prefix } = this.context;
		editor.replaceRange(
			!prefix ? value.item : `${prefix}/${value.item}`,
			start, end);
		this.close();
	}

	close() {
		super.close();
	}
}
