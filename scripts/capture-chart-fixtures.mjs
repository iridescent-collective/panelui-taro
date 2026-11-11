import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  throw new Error("Provide the pinned PanelUI checkout");
}
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const sourcePath = "packages/panelui/src/utils/chart.ts";
const pinned = execFileSync(
  "git",
  ["-C", sourceRoot, "show", `${commit}:${sourcePath}`],
  { encoding: "utf-8" }
);
const filename = path.join(sourceRoot, sourcePath);
if (fs.readFileSync(filename, "utf-8") !== pinned) {
  throw new Error("Chart source differs from the pinned commit");
}
const source = ts.createSourceFile(
  filename,
  pinned,
  ts.ScriptTarget.Latest,
  true
);
const names = new Set([
  "MAGNITUDES",
  "trimZeros",
  "mantissa",
  "compactNumber",
  "xOf",
  "yOf",
  "bandOf",
  "tangents",
  "runsOf",
  "segment",
  "linePath",
  "areaPath",
  "columnValues",
]);
const selected = source.statements.filter(
  (node) =>
    names.has(node.name?.text) ||
    (ts.isVariableStatement(node) &&
      node.declarationList.declarations.some((item) =>
        names.has(item.name.getText(source))
      ))
);
const printed = ts
  .createPrinter()
  .printFile(ts.factory.updateSourceFile(source, selected));
const compiled = ts.transpileModule(printed, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const original = {};
vm.runInContext(compiled, vm.createContext({ exports: original }), {
  timeout: 1000,
});
const cases = [];
for (const values of [
  [],
  [3],
  [0, 2],
  [0, 5, 1, 3],
  [0, null, 4, 2],
  [2, 2, 2],
]) {
  for (const plot of [
    { height: 160, left: 10, top: 12, width: 300 },
    { height: 160, left: 44, top: 12, width: 246 },
    { height: 80, left: 1, top: 2, width: 0 },
  ]) {
    for (const domain of [
      [0, 5],
      [-2, 8],
    ]) {
      for (const curve of ["linear", "monotone"]) {
        for (const loading of [false, true]) {
          cases.push({
            area: original.areaPath(values, plot, ...domain, curve, loading),
            curve,
            domain,
            line: original.linePath(values, plot, ...domain, curve, loading),
            loading,
            plot,
            values,
          });
        }
      }
    }
  }
}
const numbers = [
  -1_500_000, -1.25, -0.001, 0, 0.01, 0.125, 1, 9.99, 12.25, 999, 1000, 12_400,
  999_999, 1_000_000, 999_999_999, 1_000_000_000, 1_234_567_890_123,
].map((value) => ({ text: original.compactNumber(value), value }));
fs.writeFileSync(
  new URL("../test/fixtures/chart-source.json", import.meta.url),
  `${JSON.stringify({ cases, commit, numbers }, null, 2)}\n`
);
process.stdout.write(
  `${cases.length} paths and ${numbers.length} number labels captured\n`
);
