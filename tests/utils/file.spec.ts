import * as path from "path";
import { selectFileSync } from "../../src/utils/file";

const block = "```";

describe("node.js read file", () => {
	it("selectFileSync", async () => {
		const firstLine = await selectFileSync(
			path.resolve(__dirname, "./data.md"),
			0, 0
		);
		expect(firstLine).toBe("# data");

		const example1 = await selectFileSync(
			path.resolve(__dirname, "./data.md"),
			0, "```"
		);
		expect(example1).toBe(`# data

${block}js`);

		const example2 = await selectFileSync(
			path.resolve(__dirname, "./data.md"),
			/function/, "}"
		);
		expect(example2).toBe(`function sayHi() {
	console.log("hi");
}`);
	});
});
