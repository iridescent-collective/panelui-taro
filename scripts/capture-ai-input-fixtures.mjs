import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const root = process.argv[2] ?? "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const read = (relative) => {
  const source = fs.readFileSync(path.join(root, relative), "utf-8");
  if (
    source !==
    execFileSync("git", ["show", `${commit}:${relative}`], {
      cwd: root,
      encoding: "utf-8",
    })
  ) {
    throw new Error("AIInput source differs from pinned revision");
  }
  return source;
};
const growth = read(
  "packages/panelui/src/components/ai-input/ai-input-growth.ts"
);
const exports = {};
vm.runInNewContext(
  ts.transpileModule(growth, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  { exports },
  { timeout: 1000 }
);
const bounds = [];
for (const size of ["sm", "md", "lg"]) {
  for (const minRows of [-1, 0, 1, 2.5, 5, 8]) {
    for (const maxRows of [-2, 0, 1, 3.8, 5, 10]) {
      bounds.push({
        maxRows,
        minRows,
        result: exports.growthBounds(
          exports.AI_INPUT_METRICS[size],
          minRows,
          maxRows
        ),
        size,
      });
    }
  }
}
const source = read("packages/panelui/src/components/ai-input/index.tsx");
const file = ts.createSourceFile(
  "ai-input.tsx",
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const submit = file.statements.find(
  (node) => ts.isFunctionDeclaration(node) && node.name.text === "AIInputSubmit"
);
const names = new Set(["streaming", "hasText", "mode", "inert"]);
const statements = submit.body.statements.filter(
  (node) =>
    ts.isVariableStatement(node) &&
    names.has(node.declarationList.declarations[0].name.getText(file))
);
const body = statements
  .map((node) =>
    ts
      .createPrinter({ removeComments: true })
      .printNode(ts.EmitHint.Unspecified, node, file)
  )
  .join("\n");
const context = {};
vm.runInNewContext(
  `this.resolve=({value,status,disabled,canVoice,canStop})=>{${body};return {mode,inert}}`,
  context,
  { timeout: 1000 }
);
const modes = [];
for (const status of ["ready", "recording", "submitted", "streaming"]) {
  for (const value of ["", "  ", " ask "]) {
    for (const disabled of [false, true]) {
      for (const canVoice of [false, true]) {
        for (const canStop of [false, true]) {
          const input = { canStop, canVoice, disabled, status, value };
          modes.push({ input, result: context.resolve(input) });
        }
      }
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/ai-input-source.json", import.meta.url),
  `${JSON.stringify({ bounds, commit, modes }, null, 2)}\n`
);
