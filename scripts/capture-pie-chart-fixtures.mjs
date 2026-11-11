import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  throw new Error("Provide pinned source checkout");
}
const readPinned = (relative) => {
  const source = fs.readFileSync(path.join(sourceRoot, relative), "utf-8");
  const pinned = execFileSync(
    "git",
    [
      "-C",
      sourceRoot,
      "show",
      `b0aec40f8674dbe7f467be377bc3544359711ab0:${relative}`,
    ],
    { encoding: "utf-8" }
  );
  if (source !== pinned) {
    throw new Error("Source differs from pinned commit");
  }
  return ts.createSourceFile(
    relative,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
};
const pie = readPinned("packages/panelui/src/components/pie-chart/index.tsx");
let factory;
const visit = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    node.name.getText(pie) === "slices" &&
    node.initializer &&
    ts.isCallExpression(node.initializer)
  ) {
    factory = node.initializer.arguments[0].getText(pie);
  }
  ts.forEachChild(node, visit);
};
visit(pie);
if (!factory) {
  throw new Error("Missing source slices factory");
}
const chart = readPinned("packages/panelui/src/utils/chart.ts");
const wedge = chart.statements.find(
  (node) => ts.isFunctionDeclaration(node) && node.name?.text === "wedgePath"
);
if (!wedge) {
  throw new Error("Missing source wedge path");
}
const js = ts.transpileModule(
  `function slices(input){const {data,origin,span,padAngle,minAngle}=input;const total=data.reduce((sum,slice)=>sum+Math.max(0,slice.value),0);return (${factory})();}\n${wedge.getText(chart).replace(/^export /u, "")}`,
  { compilerOptions: { removeComments: true, target: ts.ScriptTarget.ES2022 } }
).outputText;
const angles = [];
for (const values of [[20, 30, 50], [0, 100, 0], [-1, 1, 999], [0, 0], []]) {
  for (const span of [0, 0.5, 1]) {
    for (const origin of [-0.25, 0, 2]) {
      for (const padAngle of [0, 4, 180]) {
        for (const minAngle of [0, 12, 180]) {
          const input = {
            data: values.map((value, index) => ({
              label: String(index),
              value,
            })),
            minAngle,
            origin,
            padAngle,
            span,
          };
          const context = vm.createContext({ input });
          angles.push({
            expected: vm.runInContext(`${js}\nslices(input)`, context, {
              timeout: 1000,
            }),
            input,
          });
        }
      }
    }
  }
}
const paths = [];
for (const inner of [0, 50, 100]) {
  for (const from of [-0.25, 0, 2]) {
    for (const sweep of [0, 0.001, 0.25, 0.75, 1]) {
      for (const corner of [0, 6, 200]) {
        const input = [120, 120, 100, inner, from, from + sweep, corner];
        paths.push({
          expected: vm.runInContext(
            `${js}\nwedgePath(...input)`,
            vm.createContext({ input }),
            { timeout: 1000 }
          ),
          input,
        });
      }
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/pie-chart-source.json", import.meta.url),
  `${JSON.stringify({ angles, paths }, null, 2)}\n`
);
