import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
const relative = "packages/panelui/src/components/sketch/index.tsx";
const pinned = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const source = fs.readFileSync(path.join(sourceRoot, relative), "utf-8");
if (
  source !==
  execFileSync("git", ["-C", sourceRoot, "show", `${pinned}:${relative}`], {
    encoding: "utf-8",
  })
) {
  throw new Error("Source differs from pinned commit");
}
const tree = ts.createSourceFile(
  "sketch.tsx",
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const names = new Set([
  "n",
  "strokePath",
  "shapePath",
  "safeId",
  "foldLayers",
  "svgDocument",
]);
const functions = tree.statements
  .filter(
    (node) => ts.isFunctionDeclaration(node) && names.has(node.name?.text)
  )
  .map((node) => node.getText(tree))
  .join("\n");
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  ts.transpileModule(functions, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText,
  sandbox,
  { timeout: 1000 }
);
const shapes = [];
for (let shape = 0; shape < 8; shape += 1) {
  for (const rectangle of [
    [0, 0, 0, 0],
    [10, 20, 40, 70],
    [40, 70, 10, 20],
    [-30, -20, 25, 75],
    [0, 0, 100, 0],
    [0, 0, 0, 80],
    [1.234, 6.789, 89.123, 45.678],
  ]) {
    for (const width of [2, 6, 24, 60]) {
      shapes.push({
        output: sandbox.shapePath(shape, ...rectangle, width),
        rectangle,
        shape,
        width,
      });
    }
  }
}
const strokes = [
  [],
  [10, 20],
  [10, 20, 30, 40],
  [0, 0, 10, 20, 30, 0],
  [-5.4, 3.1, 7.8, -9.2, 50, 60],
].map((points) => ({ output: sandbox.strokePath(points), points }));
const ink = { color: "#123456", d: "M1,2 l0.01,0", type: "stroke", width: 6 };
const erase = { d: "M1,2 L20,30", type: "erase", width: 15 };
const shape = {
  color: "#abcdef",
  d: sandbox.shapePath(2, 10, 20, 40, 70, 6),
  shape: "rectangle",
  type: "shape",
  width: 6,
};
const documents = [
  [],
  [ink],
  [erase],
  [ink, erase],
  [ink, erase, erase],
  [ink, erase, shape],
  [ink, erase, shape, erase],
  [ink, shape, erase, ink],
].map((items) => ({
  items,
  output: sandbox.svgDocument(items, 320.4, 200.8, "sketch-test"),
}));
const data = { commit: pinned, documents, relative, shapes, strokes };
fs.writeFileSync(
  new URL("../test/fixtures/sketch-source.json", import.meta.url),
  `${JSON.stringify(data, null, 2)}\n`
);
