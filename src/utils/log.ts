import { IS_DEV } from "./env";

const methods = <const>["log", "table", "info", "error"];

type Methods = typeof methods[number];
const _console: {
  [key in Methods]: (...args: any[]) => void;
} = {} as any;

methods.forEach((method) => {
  _console[method] = (...args: any[]) => {
    if (!IS_DEV) {
      return;
    }
    console[method](...args);
  };
});

export default _console;
