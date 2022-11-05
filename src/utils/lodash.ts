type OrdersType = "asc" | "desc";

export function sortBy(arr: any[], props: string[], orders?: OrdersType[]) {
	return [...arr].sort((a, b) =>
		props.reduce((acc, prop, i) => {
			if (acc === 0) {
				const [p1, p2] =
					orders && orders[i] === "desc"
						? [b[prop], a[prop]]
						: [a[prop], b[prop]];
				acc = p1 > p2 ? 1 : p1 < p2 ? -1 : 0;
			}
			return acc;
		}, 0)
	);
}

export function debounce(fn: Function, ms = 0) {
	let timeoutId: any;
	return function (this: any, ...args: any[]) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), ms);
	};
}

export function isObject(o: any) {
	return Object.prototype.toString.call(o) === "[object Object]";
}

export function isString(o: any): o is string {
	return Object.prototype.toString.call(o) === "[object String]";
}

export function isNumber(o: any): o is number {
	return Object.prototype.toString.call(o) === "[object Number]";
}

export function isRegExp(o: any): o is string {
	return Object.prototype.toString.call(o) === "[object RegExp]" || /\/(.*)\//.test(o);
}
