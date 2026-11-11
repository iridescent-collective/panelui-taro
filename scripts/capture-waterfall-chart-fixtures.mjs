import { execFileSync } from "node:child_process";
import fs from "node:fs";
import vm from "node:vm";

import ts from "typescript";

const root = "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const read = (path) => {
  const text = fs.readFileSync(`${root}/${path}`, "utf-8");
  if (
    text !==
    execFileSync("git", ["-C", root, "show", `${commit}:${path}`], {
      encoding: "utf-8",
    })
  ) {
    throw new Error("Unpinned source");
  }
  return text;
};
const path = "packages/panelui/src/components/waterfall-chart/index.tsx";
const source = read(path);
const ast = ts.createSourceFile(path, source, 99, true, ts.ScriptKind.TSX);
let build;
let connector;
let extent;
const functions = [];
const visit = (node) => {
  if (
    ts.isFunctionDeclaration(node) &&
    ["waterfallSteps", "bandsOf"].includes(node.name?.text)
  ) {
    functions.push(node.getText(ast).replace("export function", "function"));
  }
  if (ts.isVariableDeclaration(node) && node.initializer) {
    if (node.name.getText(ast) === "build") {
      build = node.initializer.getText(ast);
    }
    if (
      node.name.getText(ast) === "extent" &&
      ts.isCallExpression(node.initializer)
    ) {
      extent = node.initializer.arguments[0].getText(ast);
    }
  }
  if (
    ts.isFunctionDeclaration(node) &&
    node.name?.text === "WaterfallChartConnectors"
  ) {
    const find = (n) => {
      if (
        ts.isVariableDeclaration(n) &&
        n.name.getText(ast) === "animatedProps" &&
        ts.isCallExpression(n.initializer)
      ) {
        connector = n.initializer.arguments[0].getText(ast);
      }
      ts.forEachChild(n, find);
    };
    find(node);
  }
  ts.forEachChild(node, visit);
};
visit(ast);
const utils = read("packages/panelui/src/utils/chart.ts");
const parsed = ts.createSourceFile("chart.ts", utils, 99, true);
const barPath = parsed.statements
  .find(
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === "barPath"
  )
  .getText(parsed)
  .replace("export function", "function");
const finite = read(
  "packages/panelui/src/primitives/finite-chart.ts"
).replaceAll("export function", "function");
const js = ts.transpileModule(
  `${finite}\n${barPath}\n${functions.join("\n")}\nfunction evaluate(o,kind,wantActive){const {steps,plot,horizontal,barGap,barWidth,radius,minBarLength,fadedOpacity,loading}=o;const total=steps.length;const domainMin={value:o.min},domainMax={value:o.max},reveal={value:o.grow},activeIndex={value:o.active};return {bar:(${build})(kind,wantActive)(),connector:(${connector})()};}\nfunction domain(steps,yDomain){return (${extent})();}`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }
).outputText;
const datasets = [
  [],
  [
    { label: "Open", total: true, value: 100 },
    { label: "Sales", value: 40 },
    { label: "Costs", value: -70 },
    { label: "Close", total: true, value: 0 },
  ],
  [
    { label: "Loss", value: -8 },
    { label: "Recovery", value: 3 },
  ],
  [{ label: "Zero", value: 0 }],
];
const frames = [];
const domains = [];
for (const data of datasets) {
  const steps = vm.runInNewContext(
    `${js}\nwaterfallSteps(data)`,
    { data },
    { timeout: 1000 }
  );
  domains.push({
    data,
    extent: vm.runInNewContext(
      `${js}\ndomain(steps)`,
      { steps },
      { timeout: 1000 }
    ),
    steps,
  });
  for (const horizontal of [false, true]) {
    for (const grow of [0, 0.35, 1]) {
      for (const active of [-1, 1]) {
        for (const kind of ["rise", "fall", "total"]) {
          for (const wantActive of [false, true]) {
            const input = {
              active,
              barGap: 0.34,
              barWidth: 16,
              fadedOpacity: 0.3,
              grow,
              horizontal,
              loading: false,
              max: 160,
              min: -10,
              minBarLength: 2,
              plot: { height: 116, left: 10, top: 12, width: 280 },
              radius: 4,
              steps,
            };
            const expected = vm.runInNewContext(
              `${js}\nevaluate(input,kind,wantActive)`,
              { input, kind, wantActive },
              { timeout: 1000 }
            );
            frames.push({ expected, input, kind, wantActive });
          }
        }
      }
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/waterfall-chart-source.json", import.meta.url),
  `${JSON.stringify({ commit, domains, frames }, null, 2)}\n`
);
