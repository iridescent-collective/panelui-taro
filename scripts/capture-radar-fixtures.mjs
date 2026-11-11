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
  if (
    source !==
    execFileSync(
      "git",
      [
        "-C",
        sourceRoot,
        "show",
        `b0aec40f8674dbe7f467be377bc3544359711ab0:${relative}`,
      ],
      { encoding: "utf-8" }
    )
  ) {
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
const parsed = read("packages/panelui/src/components/radar-chart/index.tsx");
const sourceSeries = parsed.statements.find(
  (node) =>
    ts.isFunctionDeclaration(node) && node.name?.text === "RadarChartSeries"
);
let frame;
for (const statement of sourceSeries?.body?.statements ?? []) {
  if (!ts.isVariableStatement(statement)) {
    continue;
  }
  for (const declaration of statement.declarationList.declarations) {
    if (
      declaration.name.getText(parsed) === "animatedProps" &&
      ts.isCallExpression(declaration.initializer)
    ) {
      frame = declaration.initializer.arguments[0].getText(parsed);
    }
  }
}
let extent;
const visit = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    node.name.getText(parsed) === "extent" &&
    ts.isCallExpression(node.initializer)
  ) {
    extent = node.initializer.arguments[0].getText(parsed);
  }
  ts.forEachChild(node, visit);
};
visit(parsed);
if (!frame || !extent) {
  throw new Error("Missing source geometry");
}
const chart = read("packages/panelui/src/utils/chart.ts");
const functions = chart.statements
  .filter(
    (node) =>
      node.name?.text === "radarPath" || node.name?.text === "polarPoint"
  )
  .map((node) => node.getText(chart).replace(/^export /u, ""))
  .join("\n");
const code = `${functions}\nfunction frame(input){const {cx,cy,radius,loading}=input;const from={value:input.from};const to={value:input.to};const morph={value:input.morph};const domainMin={value:input.min};const domainMax={value:input.max};const reveal={value:input.reveal};return (${frame})().d;}\nfunction extent(input){const {data,domain}=input;const seriesKeys=input.keys.join('|');return (${extent})();}`;
const js = ts.transpileModule(code, {
  compilerOptions: { removeComments: true, target: ts.ScriptTarget.ES2022 },
}).outputText;
const frames = [];
for (const values of [
  [0.2, 0.5, 1],
  [0.2, null, 0.7, 1],
  [1, 0.4],
  [null, null, null],
  [0, 0, 0],
]) {
  for (const target of [
    values,
    values.map((value) => (value === null ? null : value * 0.7)),
  ]) {
    for (const morph of [0, 0.3, 1]) {
      for (const reveal of [0, 0.5, 1]) {
        for (const domain of [
          [0, 1],
          [-1, 2],
          [1, 1],
        ]) {
          const input = {
            cx: 152,
            cy: 116,
            from: values,
            loading: false,
            max: domain[1],
            min: domain[0],
            morph,
            radius: 90,
            reveal,
            to: target,
          };
          frames.push({
            expected: vm.runInContext(
              `${js}\nframe(input)`,
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
const extents = [];
for (const data of [
  [
    { a: 20, axis: "A", b: 100 },
    { a: 0, axis: "B", b: null },
  ],
  [{ a: -5, axis: "A", b: -2 }],
  [{ a: 0, axis: "A" }],
  [],
]) {
  for (const keys of [[], ["a"], ["a", "b"]]) {
    for (const domain of [undefined, [0, 100], [-1, 1]]) {
      const input = { data, domain, keys };
      extents.push({
        expected: vm.runInContext(
          `${js}\nextent(input)`,
          vm.createContext({ input }),
          { timeout: 1000 }
        ),
        input,
      });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/radar-source.json", import.meta.url),
  `${JSON.stringify({ extents, frames }, null, 2)}\n`
);
