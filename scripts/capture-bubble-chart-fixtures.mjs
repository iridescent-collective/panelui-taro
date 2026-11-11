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
const source = read("packages/panelui/src/components/bubble-chart/index.tsx");
const ast = ts.createSourceFile(
  "bubble.tsx",
  source,
  99,
  true,
  ts.ScriptKind.TSX
);
const callbacks = {};
const functions = [];
let circle;
const visit = (node) => {
  if (
    ts.isFunctionDeclaration(node) &&
    ["landing", "padExtent"].includes(node.name?.text)
  ) {
    functions.push(node.getText(ast));
  }
  if (
    ts.isVariableDeclaration(node) &&
    node.initializer &&
    ts.isCallExpression(node.initializer) &&
    ["extents", "sizeExtent", "bubbles", "fit"].includes(node.name.getText(ast))
  ) {
    callbacks[node.name.getText(ast)] =
      node.initializer.arguments[0].getText(ast);
  }
  if (ts.isFunctionDeclaration(node) && node.name?.text === "Bubble") {
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
for (const name of ["niceDomain", "bubbleRadius", "xAt", "yOf"]) {
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
  `${functions.join("\n")}const AXIS_STEPS=4,PALETTE_SIZE=5,STAGGER=.4;function model(data,sizeRange,sizeKey,colorKey,xDataKey,yDataKey,labelKey,palette){const xDomain=undefined,yDomain=undefined;const sizeExtent=(${callbacks.sizeExtent})();const extents=(${callbacks.extents})();const bubbles=(${callbacks.bubbles})();const fit=(${callbacks.fit})();return {sizeExtent,extents,bubbles,fit};}function frame(o){const {x,y,r,plot,opacity,total,order}=o;const start=total>1?(order/total)*STAGGER:0;const xMin={value:o.xExtent[0]},xMax={value:o.xExtent[1]},yMin={value:o.yExtent[0]},yMax={value:o.yExtent[1]},reveal={value:o.grow},selected={value:o.selection};return (${circle})();}`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }
).outputText;
const palette = ["#262626", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];
const datasets = [
  [],
  [
    { c: 2, n: "A", s: 10, x: 10, y: 20 },
    { c: "#cc00aa", n: "B", s: 30, x: 30, y: 60 },
    { c: 5, n: "C", s: 20, x: 20, y: 10 },
  ],
  [
    { n: "Missing", s: 40, x: null, y: 90 },
    { n: "Zero", s: 0, x: 0, y: 0 },
  ],
  [{ n: "Only", s: 10, x: 7, y: 9 }],
  [
    { n: "One", x: 1, y: 5 },
    { n: "Two", x: 1, y: 10 },
  ],
];
const models = [];
for (const data of datasets) {
  for (const sizeKey of [undefined, "s"]) {
    for (const colorKey of [undefined, "c"]) {
      const input = {
        colorKey,
        data,
        labelKey: "n",
        palette,
        sizeKey,
        sizeRange: [10, 28],
        xDataKey: "x",
        yDataKey: "y",
      };
      const expected = vm.runInNewContext(
        `${js}\nmodel(data,sizeRange,sizeKey,colorKey,xDataKey,yDataKey,labelKey,palette)`,
        input,
        { timeout: 1000 }
      );
      models.push({ expected, input });
    }
  }
}
const frames = [];
for (const grow of [0, 0.2, 0.4, 0.7, 1]) {
  for (const selection of [0, 0.5, 1]) {
    for (const order of [0, 1, 2]) {
      const input = {
        grow,
        opacity: 0.9,
        order,
        plot: { height: 244, left: 44, top: 28, width: 228 },
        r: 20,
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
  new URL("../test/fixtures/bubble-chart-source.json", import.meta.url),
  `${JSON.stringify({ commit, frames, models }, null, 2)}\n`
);
