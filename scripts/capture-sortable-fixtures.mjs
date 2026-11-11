import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
const pinned = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const read = (relative) => {
  const source = fs.readFileSync(path.join(sourceRoot, relative), "utf-8");
  if (
    source !==
    execFileSync("git", ["-C", sourceRoot, "show", `${pinned}:${relative}`], {
      encoding: "utf-8",
    })
  ) {
    throw new Error("Source differs from pinned commit");
  }
  return source;
};
const relative = "packages/panelui/src/components/sortable/index.tsx";
const source = read(relative);
const parsed = ts.createSourceFile(
  relative,
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const math = parsed.statements
  .filter(
    (node) =>
      ts.isFunctionDeclaration(node) &&
      ["slotOffset", "slotCenter", "targetIndex", "reorderItems"].includes(
        node.name?.text
      )
  )
  .map((node) => node.getText(parsed))
  .join("\n");
const reorder = read("packages/panelui/src/components/sortable/reorder.ts");
const sandbox = { exports: {} };
vm.createContext(sandbox);
vm.runInContext(
  ts.transpileModule(
    `${math}\n${reorder}\nexports.slotOffset=slotOffset;exports.targetIndex=targetIndex;`,
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }
  ).outputText,
  sandbox,
  { timeout: 1000 }
);
const api = sandbox.exports;
const order = ["a", "b", "c", "d"];
const heights = { a: 100, b: 40, c: 80, d: 60 };
const moves = [];
for (const flags of [{}, { b: true }, { a: true, c: true }]) {
  for (const from of [0, 1, 2, 3]) {
    for (const to of [-1, 0, 1, 2, 3, 4]) {
      const id = order[from];
      moves.push({
        from,
        id,
        output: api.moveWithPinned(order, order, flags, id, from, to),
        pinned: flags,
        to,
      });
    }
  }
}
const targets = [];
for (const current of [0, 1, 2, 3]) {
  for (const top of [-80, 0, 50, 140, 230, 400]) {
    const height = heights[order[current]];
    targets.push({
      current,
      height,
      output: api.targetIndex(order, current, top, height, heights, 8),
      top,
    });
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/sortable-source.json", import.meta.url),
  `${JSON.stringify({ heights, moves, order, pinned, targets }, null, 2)}\n`
);
