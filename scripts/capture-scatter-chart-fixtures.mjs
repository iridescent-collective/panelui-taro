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
const source = read("packages/panelui/src/components/scatter-chart/index.tsx");
const ast = ts.createSourceFile(
  "scatter.tsx",
  source,
  99,
  true,
  ts.ScriptKind.TSX
);
const functions = [];
let extents;
let circle;
const visit = (node) => {
  if (
    ts.isFunctionDeclaration(node) &&
    ["landing", "padExtent", "radiusFor"].includes(node.name?.text)
  ) {
    functions.push(node.getText(ast));
  }
  if (
    ts.isVariableDeclaration(node) &&
    node.name.getText(ast) === "extents" &&
    ts.isCallExpression(node.initializer)
  ) {
    extents = node.initializer.arguments[0].getText(ast);
  }
  if (ts.isFunctionDeclaration(node) && node.name?.text === "Dot") {
    const find = (n) => {
      if (
        ts.isVariableDeclaration(n) &&
        n.name.getText(ast) === "animatedProps" &&
        ts.isCallExpression(n.initializer)
      ) {
        circle = n.initializer.arguments[0].getText(ast);
      }
      ts.forEachChild(n, find);
    };
    find(node);
  }
  ts.forEachChild(node, visit);
};
visit(ast);
const utility = read("packages/panelui/src/utils/chart.ts");
const parsed = ts.createSourceFile("chart.ts", utility, 99, true);
for (const name of ["xAt", "yOf"]) {
  functions.push(
    parsed.statements
      .find(
        (node) => ts.isFunctionDeclaration(node) && node.name?.text === name
      )
      .getText(parsed)
      .replace("export function", "function")
  );
}
const js = ts.transpileModule(
  `${functions.join("\n")}const STAGGER=.4;function model(data,xDataKey,keys,xDomain,yDomain){const seriesKeys=keys.join("|");return (${extents})();}function frame(o){const {x,y,r,plot,opacity,total,order}=o;const start=total>1?(order/total)*STAGGER:0;const xMin={value:o.xExtent[0]},xMax={value:o.xExtent[1]},yMin={value:o.yExtent[0]},yMax={value:o.yExtent[1]},reveal={value:o.grow},selected={value:o.selection};return (${circle})();}`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }
).outputText;
const datasets = [
  [],
  [
    { a: 20, b: 60, s: 10, x: 10 },
    { a: 60, b: 10, s: 30, x: 30 },
    { a: 0, b: null, s: 20, x: 20 },
  ],
  [
    { a: 900, x: null },
    { a: 0, x: 0 },
  ],
  [{ a: 9, x: 7 }],
];
const models = [];
for (const data of datasets) {
  for (const keys of [[], ["a"], ["a", "b"]]) {
    const input = { data, keys, xDataKey: "x" };
    const expected = vm.runInNewContext(
      `${js}\nmodel(data,xDataKey,keys)`,
      input,
      { timeout: 1000 }
    );
    models.push({ expected, input });
  }
}
const frames = [];
for (const grow of [0, 0.2, 0.4, 0.7, 1]) {
  for (const selection of [0, 0.5, 1]) {
    for (const order of [0, 1, 2]) {
      const input = {
        grow,
        opacity: 0.75,
        order,
        plot: { height: 244, left: 44, top: 14, width: 228 },
        r: 4.5,
        selection,
        total: 3,
        x: 20,
        xExtent: [0, 40],
        y: 30,
        yExtent: [0, 80],
      };
      const expected = vm.runInNewContext(
        `${js}\nframe(input)`,
        { input },
        { timeout: 1000 }
      );
      frames.push({ expected, input });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/scatter-chart-source.json", import.meta.url),
  `${JSON.stringify({ commit, frames, models }, null, 2)}\n`
);
