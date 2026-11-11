import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const root = process.argv[2] ?? "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const relative =
  "packages/panelui/src/components/timeline/timeline-geometry.ts";
const source = fs.readFileSync(path.join(root, relative), "utf-8");
if (
  source !==
  execFileSync("git", ["show", `${commit}:${relative}`], {
    cwd: root,
    encoding: "utf-8",
  })
) {
  throw new Error("Timeline source differs from pinned revision");
}
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const exports = {};
vm.runInNewContext(code, { exports }, { timeout: 1000 });
const widths = [];
for (const requested of [
  undefined,
  -1,
  0,
  1,
  76,
  140,
  268,
  320,
  Number.NaN,
  Infinity,
]) {
  let recorded = requested;
  if (requested === undefined) {
    recorded = "undefined";
  } else if (Number.isNaN(requested)) {
    recorded = "NaN";
  } else if (requested === Infinity) {
    recorded = "Infinity";
  }
  for (const filled of [false, true]) {
    widths.push({
      filled,
      requested: recorded,
      result: exports.timelineColumnWidth(requested, filled),
    });
  }
}
const sequences = [
  [],
  [76],
  [268, 76, 268],
  [140, 320, 1],
  [76, 76, 268, 76, 268, 268],
  [0.5, 1.5, 268],
  [320, 140, 76],
];
fs.writeFileSync(
  new URL("../test/fixtures/timeline-source.json", import.meta.url),
  `${JSON.stringify({ commit, offsets: sequences.map((input) => ({ input, result: exports.timelineColumnOffsets(input) })), widths }, null, 2)}\n`
);
