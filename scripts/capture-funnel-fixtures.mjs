import { execFileSync } from "node:child_process";
import fs from "node:fs";
import vm from "node:vm";

import ts from "typescript";

const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const path = "packages/panelui/src/components/funnel-chart/index.tsx";
const root = "/Users/iridescent/front_end/PanelUI";
const source = fs.readFileSync(`${root}/${path}`, "utf-8");
if (
  source !==
  execFileSync("git", ["-C", root, "show", `${commit}:${path}`], {
    encoding: "utf-8",
  })
) {
  throw new Error("Source changed");
}
const ast = ts.createSourceFile(path, source, 99, true, ts.ScriptKind.TSX);
const callbacks = {};
const visit = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    ["bands", "shares", "steps", "windows"].includes(node.name.getText(ast)) &&
    node.initializer &&
    ts.isCallExpression(node.initializer) &&
    node.initializer.expression.getText(ast) === "useMemo"
  ) {
    callbacks[node.name.getText(ast)] =
      node.initializer.arguments[0].getText(ast);
  }
  ts.forEachChild(node, visit);
};
visit(ast);
const callbackText = Object.entries(callbacks)
  .map(([name, fn]) => `${name}: (${fn})()`)
  .join(",");
const script = ts.transpileModule(`result=({${callbackText}})`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
const frames = [];
for (const values of [
  [100, 60, 10],
  [10, 50, 0],
  [-20, 0, 5],
  [0, 0, 0],
  [42],
  [],
]) {
  for (const width of [0, 240, 375]) {
    for (const mirrored of [false, true]) {
      for (const floor of [0, 0.1, 0.5]) {
        const data = values.map((value, index) => ({
          label: `Stage ${index}`,
          value,
        }));
        const count = data.length;
        const height = 200;
        const spacing = 4;
        const size = Math.max(0, (width - (count - 1) * spacing) / count);
        const reach = 70;
        const peak = Math.max(0, ...values);
        const first = Math.max(0, values[0] ?? 0);
        const stagger = 90;
        const animationDuration = 700;
        const total = animationDuration + Math.max(count - 1, 0) * stagger;
        const sandbox = {
          animationDuration,
          count,
          data,
          first,
          height,
          minWidth: floor,
          mirrored,
          peak,
          reach,
          size,
          spacing,
          stagger,
          total,
          width,
        };
        vm.runInNewContext(script, sandbox, { timeout: 1000 });
        frames.push({
          expected: sandbox.result,
          floor,
          mirrored,
          values,
          width,
        });
      }
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/funnel-source.json", import.meta.url),
  `${JSON.stringify({ commit, frames }, null, 2)}\n`
);
