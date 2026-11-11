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
const source = read("packages/panelui/src/components/hex-chart/index.tsx");
const ast = ts.createSourceFile("hex.tsx", source, 99, true, ts.ScriptKind.TSX);
let plan;
let empty;
const visit = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    node.name.getText(ast) === "plan" &&
    ts.isCallExpression(node.initializer)
  ) {
    plan = node.initializer.arguments[0].getText(ast);
  }
  if (
    ts.isVariableDeclaration(node) &&
    node.name.getText(ast) === "EMPTY_PLAN"
  ) {
    empty = node.initializer.getText(ast);
  }
  ts.forEachChild(node, visit);
};
visit(ast);
const utility = read("packages/panelui/src/utils/chart.ts");
const parsed = ts.createSourceFile("chart.ts", utility, 99, true);
const functions = [];
for (const name of [
  "hexMetrics",
  "hexRadiusFor",
  "hexRowsFor",
  "hexCenter",
  "hexPath",
  "hashUnit",
  "shareCounts",
  "hexFillOrder",
  "hexAt",
  "polarPoint",
]) {
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
  `${functions.join("\n")}const BLOB_WOBBLE=.09;const EMPTY_PLAN=${empty};function evaluate(data,width,columnCount,shape,density,loading){const height=width/1.6;const cellGap=.14;const metrics=hexMetrics(hexRadiusFor(width,columnCount));const rows=hexRowsFor(height,metrics);const fieldWidth=metrics.stepX*(columnCount+.5),fieldHeight=(rows-1)*metrics.stepY+metrics.height,left=(width-fieldWidth)/2,top=(height-fieldHeight)/2;const plan=(${plan})();return {metrics,rows,fieldWidth,fieldHeight,left,top,plan};}`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }
).outputText;
const models = [];
for (const values of [[100, 60, 10], [1, 1, 1], [-5, 10, 0], [0, 0, 0], []]) {
  for (const columns of [5, 21]) {
    for (const shape of ["blob", "grid"]) {
      for (const loading of [false, true]) {
        const data = values.map((value, index) => ({
          label: `Series ${index}`,
          value,
        }));
        const input = {
          columns,
          data,
          density: 0.55,
          loading,
          shape,
          width: 300,
        };
        const expected = vm.runInNewContext(
          `${js}\nevaluate(data,width,columns,shape,density,loading)`,
          input,
          { timeout: 1000 }
        );
        models.push({ expected, input });
      }
    }
  }
}
const counts = [];
for (const values of [[1, 1, 1], [9, 1, 0], [-1, 3, 7], [0, 0], []]) {
  for (const budget of [0, 1, 2, 100]) {
    const expected = vm.runInNewContext(
      `${js}\nshareCounts(values,budget)`,
      { budget, values },
      { timeout: 1000 }
    );
    counts.push({ budget, expected, values });
  }
}
const hits = [];
for (const x of [-5, 20, 30, 50, 100, 150, 290, 305]) {
  for (const y of [-5, 5, 30, 65, 120, 180, 205]) {
    const metrics = vm.runInNewContext(
      `${js}\nhexMetrics(hexRadiusFor(300,21))`,
      {},
      { timeout: 1000 }
    );
    const rows = vm.runInNewContext(
      `${js}\nhexRowsFor(187.5,metrics)`,
      { metrics },
      { timeout: 1000 }
    );
    const left = (300 - metrics.stepX * 21.5) / 2;
    const top = (187.5 - ((rows - 1) * metrics.stepY + metrics.height)) / 2;
    const input = { columns: 21, left, metrics, rows, top, x, y };
    const expected = vm.runInNewContext(
      `${js}\nhexAt(x,y,metrics,left,top,columns,rows)`,
      input,
      { timeout: 1000 }
    );
    hits.push({ expected, input });
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/hex-chart-source.json", import.meta.url),
  `${JSON.stringify({ commit, counts, hits, models }, null, 2)}\n`
);
