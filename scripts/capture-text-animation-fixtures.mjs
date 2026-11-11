import { execFileSync } from "node:child_process";
import fs from "node:fs";
import vm from "node:vm";

import ts from "typescript";

const root = "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const path = "packages/panelui/src/components/text-animation/index.tsx";
const input = fs.readFileSync(`${root}/${path}`, "utf-8");
if (
  input !==
  execFileSync("git", ["-C", root, "show", `${commit}:${path}`], {
    encoding: "utf-8",
  })
) {
  throw new Error("Upstream source changed");
}
const ast = ts.createSourceFile(path, input, 99, true, ts.ScriptKind.TSX);
const typing = ast.statements.find(
  (node) =>
    ts.isFunctionDeclaration(node) && node.name.text === "TextAnimationTyping"
);
let effect;
const visit = (node) => {
  if (
    ts.isCallExpression(node) &&
    node.expression.getText(ast) === "useEffect"
  ) {
    effect = node.arguments[0].getText(ast);
  }
  ts.forEachChild(node, visit);
};
visit(typing);
const compiled = ts.transpileModule(`cleanup=(${effect})();`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
const traces = [];
for (const strings of [["Book"], ["Hi", "Bye"], ["你好", "🌱"], []]) {
  for (const repeat of [false, true]) {
    let time = 0;
    let identity = 0;
    const pending = new Map();
    const frames = [];
    const context = {
      clearTimeout: (id) => pending.delete(id),
      done: { current: () => frames.push({ done: true, time }) },
      hold: 100,
      repeat,
      setShown: (value) =>
        frames.push({
          codeUnits: Array.from(
            { length: value.length },
            (_, index) => value.slice(index, index + 1).codePointAt(0) ?? 0
          ),
          time,
        }),
      setTimeout: (fn, delay) => {
        identity += 1;
        pending.set(identity, { at: time + delay, fn });
        return identity;
      },
      setTyping: (value) => {
        context.typing = value;
      },
      step: 55,
      still: false,
      strings,
      wait: 40,
    };
    vm.runInNewContext(compiled, context, { timeout: 1000 });
    for (let turn = 0; turn < 500; turn += 1) {
      const [next] = [...pending.entries()].toSorted(
        (a, b) => a[1].at - b[1].at
      );
      if (!next || next[1].at > 1500) {
        break;
      }
      pending.delete(next[0]);
      time = next[1].at;
      next[1].fn();
    }
    context.cleanup?.();
    traces.push({ frames, repeat, strings });
  }
}
const scrolling = ast.statements.find(
  (node) =>
    ts.isFunctionDeclaration(node) &&
    node.name.text === "TextAnimationScrolling"
);
let valuesBody;
const find = (node) => {
  if (ts.isVariableDeclaration(node) && node.name.getText(ast) === "values") {
    valuesBody = node.initializer.arguments[0].getText(ast);
  }
  ts.forEachChild(node, find);
};
find(scrolling);
const valuesScript = ts.transpileModule(`values=(${valuesBody})();`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
const scales = [];
for (const value of [0, 7, 20, 120, 999, -10]) {
  for (const step of [1, 10, 0]) {
    for (const around of [0, 2, 4]) {
      const context = { around, step, value };
      vm.runInNewContext(valuesScript, context, { timeout: 1000 });
      const { values } = context;
      const found = values.indexOf(value);
      scales.push({
        around,
        step,
        target: Math.max(
          0,
          (found === -1 ? values.length - 1 : found) - around
        ),
        value,
        values,
      });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/text-animation-source.json", import.meta.url),
  `${JSON.stringify({ commit, scales, traces }, null, 2)}\n`
);
