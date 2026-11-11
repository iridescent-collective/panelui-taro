import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
const relative = "packages/panelui/src/components/combobox/index.tsx";
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
const parsed = ts.createSourceFile(
  relative,
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const functions = {};
const visit = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    ["select", "submit"].includes(node.name.getText(parsed))
  ) {
    functions[node.name.getText(parsed)] =
      node.initializer.arguments[0].getText(parsed);
  }
  ts.forEachChild(node, visit);
};
visit(parsed);
const code = `function run(input){const multiple=input.multiple;const selection=input.selection;const query=input.query;const allowCustomValue=input.custom;const options=[{value:'red',label:'Red'},{value:'green',label:'Green'},{value:'grey',label:'Grey',disabled:true}];const events=[];const commit=v=>events.push({kind:'commit',value:v});const setQuery=v=>events.push({kind:'query',value:v});const close=()=>events.push({kind:'close'});const inputRef={current:{blur:()=>events.push({kind:'blur'})}};const labelOf=v=>options.find(o=>o.value===v)?.label??v;const select=${functions.select};const submit=${functions.submit};submit();return events}`;
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  ts.transpileModule(code, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText,
  sandbox,
  { timeout: 1000 }
);
const submissions = [];
for (const multiple of [false, true]) {
  for (const custom of [false, true]) {
    for (const query of ["red", " Red ", "Novel", "Grey", " "]) {
      const input = {
        custom,
        multiple,
        query,
        selection: multiple ? ["green"] : "green",
      };
      submissions.push({ input, output: sandbox.run(input) });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/combobox-source.json", import.meta.url),
  `${JSON.stringify({ pinned, submissions }, null, 2)}\n`
);
