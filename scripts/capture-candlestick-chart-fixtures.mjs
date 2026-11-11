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
const source = read(
  "packages/panelui/src/components/candlestick-chart/index.tsx"
);
const ast = ts.createSourceFile(
  "candle.tsx",
  source,
  99,
  true,
  ts.ScriptKind.TSX
);
let extent;
let columns;
let body;
let highlight;
let ohlc;
const visit = (node) => {
  if (ts.isFunctionDeclaration(node) && node.name?.text === "ohlcOf") {
    ohlc = node.getText(ast);
  }
  if (
    ts.isVariableDeclaration(node) &&
    node.initializer &&
    ts.isCallExpression(node.initializer)
  ) {
    if (node.name.getText(ast) === "extent") {
      extent = node.initializer.arguments[0].getText(ast);
    }
    if (node.name.getText(ast) === "columns") {
      columns = node.initializer.arguments[0].getText(ast);
    }
  }
  if (
    ts.isFunctionDeclaration(node) &&
    ["CandlestickChartCandles", "CandlestickHighlight"].includes(
      node.name?.text
    )
  ) {
    const find = (n) => {
      if (ts.isVariableDeclaration(n) && n.name.getText(ast) === "build") {
        if (node.name.text === "CandlestickHighlight") {
          highlight = n.initializer.getText(ast);
        } else {
          body = n.initializer.getText(ast);
        }
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
const functions = [ohlc];
for (const name of ["bandOf", "yOf"]) {
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
  `${functions.join("\n")}const WICK_WIDTH=1.5,MIN_BODY_HEIGHT=1.5;function evaluate(o,wantRising,wicks){const {data,plot,width,cornerRadius}=o;const openKey="open",highKey="high",lowKey="low",closeKey="close";const columns=(${columns})();const total=data.length;const domainMin={value:o.min},domainMax={value:o.max},reveal={value:o.grow},activeIndex={value:o.active};return {body:(${body})(wantRising,wicks)(),highlight:(${highlight})(wantRising)()};}function domain(data,yDomain){const openDataKey="open",highDataKey="high",lowDataKey="low",closeDataKey="close";return (${extent})();}`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }
).outputText;
const datasets = [
  [
    { close: 105, date: "Mon", high: 108, low: 94, open: 100 },
    { close: 100, date: "Tue", high: 111, low: 93, open: 105 },
    { close: 100, date: "Wed", high: 103, low: 97, open: 100 },
    { close: 104, date: "Missing", high: null, low: 93, open: 100 },
  ],
  [],
  [{ close: 0, date: "Flat", high: 0, low: 0, open: 0 }],
];
const frames = [];
for (const data of datasets) {
  for (const grow of [0, 0.35, 1]) {
    for (const active of [-1, 1]) {
      for (const wantRising of [false, true]) {
        for (const wicks of [false, true]) {
          const input = {
            active,
            cornerRadius: 1.5,
            data,
            grow,
            max: 120,
            min: 90,
            plot: { height: 140, left: 48, top: 12, width: 242 },
            width: 30,
          };
          const expected = vm.runInNewContext(
            `${js}\nevaluate(input,wantRising,wicks)`,
            { input, wantRising, wicks },
            { timeout: 1000 }
          );
          frames.push({ expected, input, wantRising, wicks });
        }
      }
    }
  }
}
const domains = [];
for (const data of datasets) {
  for (const yDomain of [undefined, [80, 140]]) {
    const expected = vm.runInNewContext(
      `${js}\ndomain(data,yDomain)`,
      { data, yDomain },
      { timeout: 1000 }
    );
    domains.push({ data, expected, yDomain });
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/candlestick-chart-source.json", import.meta.url),
  `${JSON.stringify({ commit, domains, frames }, null, 2)}\n`
);
