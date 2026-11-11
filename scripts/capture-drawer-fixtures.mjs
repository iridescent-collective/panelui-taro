import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  throw new Error("Provide pinned source checkout");
}
const relative = "packages/panelui/src/components/drawer/index.tsx";
const text = fs.readFileSync(path.join(sourceRoot, relative), "utf-8");
if (
  text !==
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
  text,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const declarations = new Map();
const visit = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    node.initializer &&
    ["WIDTH", "HEIGHT", "extent", "outward", "physical"].includes(
      node.name.getText(parsed)
    )
  ) {
    declarations.set(
      node.name.getText(parsed),
      node.initializer.getText(parsed)
    );
  }
  ts.forEachChild(node, visit);
};
visit(parsed);
for (const key of ["WIDTH", "HEIGHT", "extent", "outward", "physical"]) {
  if (!declarations.has(key)) {
    throw new Error(`Missing ${key}`);
  }
}
const code = `const WIDTH=${declarations.get("WIDTH")}; const HEIGHT=${declarations.get("HEIGHT")}; function geometry(input){ const {width:screenWidth,height:screenHeight,side,size,direction:dir}=input; const sign=dir==='ltr'?1:-1;const horizontal=side==='start'||side==='end';const extent=${declarations.get("extent")};const outward=${declarations.get("outward")};const physical=${declarations.get("physical")};return {extent,horizontal,outward,physical};}`;
const context = {};
vm.createContext(context);
vm.runInContext(
  ts.transpileModule(code, {
    compilerOptions: { removeComments: true, target: ts.ScriptTarget.ES2022 },
  }).outputText,
  context,
  { timeout: 1000 }
);
const geometry = [];
for (const width of [320, 390, 1024]) {
  for (const height of [568, 812]) {
    for (const side of ["start", "end", "top", "bottom"]) {
      for (const size of ["sm", "md", "lg", "full"]) {
        for (const direction of ["ltr", "rtl"]) {
          const input = { direction, height, side, size, width };
          context.input = input;
          const expected = vm.runInContext("geometry(input)", context, {
            timeout: 1000,
          });
          geometry.push({ expected, input });
        }
      }
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/drawer-source.json", import.meta.url),
  `${JSON.stringify({ geometry, sourceCommit: "b0aec40f8674dbe7f467be377bc3544359711ab0" }, null, 2)}\n`
);
