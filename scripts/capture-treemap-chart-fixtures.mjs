import { execFileSync } from "node:child_process";
import fs from "node:fs";
import vm from "node:vm";

import ts from "typescript";

const root = "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const path = "packages/panelui/src/components/treemap-chart/index.tsx";
const source = fs.readFileSync(`${root}/${path}`, "utf-8");
if (
  source !==
  execFileSync("git", ["-C", root, "show", `${commit}:${path}`], {
    encoding: "utf-8",
  })
) {
  throw new Error("Unpinned source");
}
const ast = ts.createSourceFile(
  "source.tsx",
  source,
  99,
  true,
  ts.ScriptKind.TSX
);
let frame;
let parts;
let tiles;
const visit = (n) => {
  if (
    ts.isVariableDeclaration(n) &&
    n.initializer &&
    ts.isCallExpression(n.initializer)
  ) {
    if (n.name.getText(ast) === "parts") {
      parts = n.initializer.arguments[0].getText(ast);
    }
    if (n.name.getText(ast) === "tiles") {
      tiles = n.initializer.arguments[0].getText(ast);
    }
  }
  if (ts.isFunctionDeclaration(n) && n.name?.text === "Tile") {
    const inspect = (node) => {
      if (
        ts.isVariableDeclaration(node) &&
        node.name.getText(ast) === "animatedProps"
      ) {
        frame = node.initializer.arguments[0].getText(ast);
      }
      ts.forEachChild(node, inspect);
    };
    inspect(n);
  }
  ts.forEachChild(n, visit);
};
visit(ast);
const functions = ast.statements
  .filter((n) =>
    ["diceRow", "sliceRow", "squarifyLayout"].includes(n.name?.text)
  )
  .map((n) => n.getText(ast).replace("export function", "function"))
  .join("\n");
const js = ts.transpileModule(
  `const TARGET_RATIO=(1+Math.sqrt(5))/2,FADE=.45;${functions}function model(data,sort,maxTiles,otherLabel,size,gap,hue){const parts=(${parts})();const total=parts.reduce((sum,part)=>sum+part.value,0);return {parts,total,tiles:(${tiles})()};}function tileFrame(tile,window,progress,fade,dimOpacity){const reveal={value:progress},dim={value:fade};return (${frame})();}`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }
).outputText;
const layouts = [];
for (const values of [
  [6, 4, 3, 2, 1],
  [100, 1, 1, 1, 1, 1],
  [0, 4, 0, 2],
  [0],
  [],
  [3],
]) {
  for (const width of [300, 90]) {
    for (const height of [220, 420]) {
      const expected = vm.runInNewContext(
        `${js};squarifyLayout(values,width,height)`,
        { height, values, width },
        { timeout: 1000 }
      );
      layouts.push({ expected, height, values, width });
    }
  }
}
const data = [
  { label: "A", value: 80 },
  { color: "#fedcba", label: "B", value: 120 },
  { label: "C", value: -10 },
  { label: "D", value: 35 },
  { label: "E", value: 15 },
];
const models = [];
for (const sort of [true, false]) {
  for (const maxTiles of [undefined, 1, 3, 10]) {
    for (const gap of [0, 3, -3, 100]) {
      const size = { height: 214, width: 300 };
      const expected = vm.runInNewContext(
        `${js};model(data,sort,maxTiles,'Others',size,gap,'#262626')`,
        { data, gap, maxTiles, size, sort },
        { timeout: 1000 }
      );
      models.push({ data, expected, gap, maxTiles, size, sort });
    }
  }
}
const frames = [];
const tile = {
  color: "#262626",
  height: 86,
  label: "A",
  share: 0.2,
  sourceIndex: 0,
  strength: 0.7,
  value: 50,
  width: 104,
  x: 32,
  y: 18,
};
for (const window of [
  { from: 0, to: 1 },
  { from: 0.2, to: 0.8 },
  { from: 0.6, to: 0.6 },
]) {
  for (const progress of [0, 0.2, 0.5, 0.75, 1]) {
    for (const dim of [0, 0.5, 1]) {
      const expected = vm.runInNewContext(
        `${js};tileFrame(tile,window,progress,dim,.35)`,
        { dim, progress, tile, window },
        { timeout: 1000 }
      );
      frames.push({ dim, expected, progress, tile, window });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/treemap-chart-source.json", import.meta.url),
  `${JSON.stringify({ commit, frames, layouts, models }, null, 2)}\n`
);
