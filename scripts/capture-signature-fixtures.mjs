import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  throw new Error("Provide pinned source checkout");
}
const relative = "packages/panelui/src/components/signature/index.tsx";
const code = fs.readFileSync(path.join(sourceRoot, relative), "utf-8");
if (
  code !==
  execFileSync(
    "git",
    [
      "-C",
      sourceRoot,
      "show",
      `b0aec40f8674dbe7f467be377bc3544359711ab0:${relative}`,
    ],
    { encoding: "utf-8" }
  )
) {
  throw new Error("Source differs from pinned commit");
}
const parsed = ts.createSourceFile(
  relative,
  code,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const declaration = parsed.statements.find(
  (node) => ts.isFunctionDeclaration(node) && node.name?.text === "strokePath"
);
if (!declaration) {
  throw new Error("Missing source stroke path");
}
const context = {};
vm.createContext(context);
vm.runInContext(
  ts.transpileModule(declaration.getText(parsed), {
    compilerOptions: { removeComments: true, target: ts.ScriptTarget.ES2022 },
  }).outputText,
  context,
  { timeout: 1000 }
);
const paths = [];
for (const count of [0, 1, 2, 3, 12, 64]) {
  for (const direction of [-1, 0, 1]) {
    const input = Array.from({ length: count }, (_, index) => [
      direction * index * 3.17 + 0.25,
      Math.sin(index) * 14.73 + 21,
    ]).flat();
    context.input = input;
    const expected = vm.runInContext("strokePath(input)", context, {
      timeout: 1000,
    });
    paths.push({ expected, input });
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/signature-source.json", import.meta.url),
  `${JSON.stringify({ paths, sourceCommit: "b0aec40f8674dbe7f467be377bc3544359711ab0" }, null, 2)}\n`
);
