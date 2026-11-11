import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  throw new Error("Provide the pinned PanelUI checkout");
}
const commit = execFileSync("git", ["-C", sourceRoot, "rev-parse", "HEAD"], {
  encoding: "utf-8",
}).trim();
if (commit !== "b0aec40f8674dbe7f467be377bc3544359711ab0") {
  throw new Error("ThinkingOrb source differs from the pinned commit");
}
const filename = path.join(
  sourceRoot,
  "packages/panelui/src/components/thinking-orb/index.tsx"
);
const source = ts.createSourceFile(
  filename,
  fs.readFileSync(filename, "utf-8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const constants = new Set([
  "BUCKETS",
  "MIN_INK",
  "MIN_RADIUS",
  "PROFILES",
  "SHAPES",
]);
const statements = source.statements.filter(
  (node) =>
    (ts.isVariableStatement(node) &&
      node.declarationList.declarations.some((item) =>
        constants.has(item.name.getText(source))
      )) ||
    (ts.isFunctionDeclaration(node) &&
      node.name.text !== "Bucket" &&
      node.name.text !== "ThinkingOrb")
);
const extracted = ts.factory.updateSourceFile(source, statements);
const text = `${ts.createPrinter().printFile(extracted)}\nexport { renderFrame, PROFILES };`;
const compiled = ts.transpileModule(text, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const original = {};
vm.runInContext(compiled, vm.createContext({ exports: original }), {
  timeout: 1000,
});
const states = [
  "working",
  "searching",
  "solving",
  "listening",
  "composing",
  "shaping",
];
const samples = [];
for (const state of states) {
  for (const size of [20, 32, 33, 64, 96]) {
    for (const time of [0, 0.128, 2.4, 4.2, 6.8]) {
      const profile = original.PROFILES[state][size <= 32 ? "sm" : "md"];
      samples.push({
        paths: original.renderFrame(state, size, time, profile),
        size,
        state,
        time,
      });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/thinking-orb-source.json", import.meta.url),
  `${JSON.stringify({ commit, samples }, null, 2)}\n`
);
console.log({ frames: samples.length });
