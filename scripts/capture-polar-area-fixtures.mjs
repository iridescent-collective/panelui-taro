import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  throw new Error("Provide pinned source checkout");
}
const read = (relative) => {
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
const source = read(
  "packages/panelui/src/components/polar-area-chart/index.tsx"
);
const factories = {};
const visit = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    ["radiusOf", "wedges", "maxValue"].includes(node.name.getText(source)) &&
    node.initializer &&
    ts.isCallExpression(node.initializer)
  ) {
    factories[node.name.getText(source)] =
      node.initializer.arguments[0].getText(source);
  }
  ts.forEachChild(node, visit);
};
visit(source);
if (!factories.radiusOf || !factories.wedges || !factories.maxValue) {
  throw new Error("Missing source factories");
}
const nice = source.statements
  .filter(
    (node) =>
      node.name?.text === "niceMax" ||
      (ts.isVariableStatement(node) &&
        node.declarationList.declarations.some(
          (d) => d.name.getText(source) === "NICE_STEPS"
        ))
  )
  .map((node) => node.getText(source))
  .join("\n");
const code = `${nice}\nfunction evaluate(input){const {data,radius,origin,padAngle,scale}=input;const maxValueProp=input.maxValue;const maxValue=(${factories.maxValue})();const radiusOf=(${factories.radiusOf})();const wedges=(${factories.wedges})();return {maxValue,wedges};}`;
const compile = (value) =>
  ts.transpileModule(value, {
    compilerOptions: { removeComments: true, target: ts.ScriptTarget.ES2022 },
  }).outputText;
const js = compile(code);
const wedges = [];
for (const values of [[20, 30, 50], [-1, 0, 147], []]) {
  for (const scale of ["radius", "area"]) {
    for (const radius of [0, 80, 120]) {
      for (const origin of [-0.25, 0, 2]) {
        for (const padAngle of [0, 6, 360]) {
          for (const maxValue of [undefined, 0, 100]) {
            const input = {
              data: values.map((value, index) => ({
                label: String(index),
                value,
              })),
              maxValue,
              origin,
              padAngle,
              radius,
              scale,
            };
            wedges.push({
              expected: vm.runInContext(
                `${js}\nevaluate(input)`,
                vm.createContext({ input }),
                { timeout: 1000 }
              ),
              input,
            });
          }
        }
      }
    }
  }
}
const chart = read("packages/panelui/src/utils/chart.ts");
const names = new Set([
  "channelsOf",
  "linear",
  "luminanceOf",
  "tone",
  "seriesColorAt",
  "inkOn",
  "ChartInk",
  "LIGHT_INK",
  "DARK_INK",
  "INK_FLOOR",
  "FALLBACK_SERIES",
]);
const helpers = chart.statements
  .filter(
    (node) =>
      names.has(node.name?.text) ||
      (ts.isVariableStatement(node) &&
        node.declarationList.declarations.some((d) =>
          names.has(d.name.getText(chart))
        ))
  )
  .map((node) => node.getText(chart).replace(/^export /u, ""))
  .join("\n");
const colors = [];
for (const palette of [
  ["#262626", "#fafafa"],
  ["#3b82f6", "rgb(90%, 20%, 30%)"],
  [],
]) {
  for (const index of [0, 1, 2, 4, 5, 10, 20]) {
    const input = { index, palette };
    colors.push({
      expected: vm.runInContext(
        `${compile(helpers)}\nseriesColorAt(input.palette,input.index)`,
        vm.createContext({ input }),
        { timeout: 1000 }
      ),
      input,
    });
  }
}
const ink = [];
for (const fill of [
  "#000",
  "#fff",
  "#3b82f6",
  "rgba(120,30,200,0.5)",
  "unknown",
]) {
  for (const opacity of [0, 0.3, 1]) {
    const input = { behind: "#ffffff", fill, opacity };
    ink.push({
      expected: vm.runInContext(
        `${compile(helpers)}\ninkOn(input.fill,input.behind,input.opacity)`,
        vm.createContext({ input }),
        { timeout: 1000 }
      ),
      input,
    });
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/polar-area-source.json", import.meta.url),
  `${JSON.stringify({ colors, ink, wedges }, null, 2)}\n`
);
