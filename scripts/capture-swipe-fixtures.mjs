import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  throw new Error("Provide pinned source checkout");
}
const relative = "packages/panelui/src/components/swipe/index.tsx";
const source = fs.readFileSync(path.join(sourceRoot, relative), "utf-8");
if (
  source !==
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
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const callbacks = {};
const visit = (node) => {
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ["onUpdate", "onEnd"].includes(node.expression.name.text)
  ) {
    callbacks[node.expression.name.text] = node.arguments[0].getText(parsed);
  }
  ts.forEachChild(node, visit);
};
visit(parsed);
if (!callbacks.onUpdate || !callbacks.onEnd) {
  throw new Error("Missing source pan callbacks");
}
const constants = parsed.statements
  .filter(
    (node) =>
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.some((declaration) =>
        [
          "SPRING",
          "OVERSHOOT_FRICTION",
          "FULL_SWIPE_RATIO",
          "OPEN_RATIO",
          "VELOCITY_LOOKAHEAD",
        ].includes(declaration.name.getText(parsed))
      )
  )
  .map((node) => node.getText(parsed))
  .join("\n");
const code = `${constants}\nfunction frame(input){const sign=input.sign;const fullSwipe=input.full;const haptics=false;const origin={value:input.origin};const offset={value:input.origin};const startWidth={value:input.start};const endWidth={value:input.end};const armed={value:false};const runOnJS=f=>f;const withSpring=v=>v;let fired=false;let side=null;const fire=()=>{fired=true};const reportOpen=v=>{side=v};const announce=v=>{side=v};const tick=()=>{};(${callbacks.onUpdate})({translationX:input.translation});const dragged=offset.value;(${callbacks.onEnd})({velocityX:input.velocity});return {dragged,fire:fired,side,target:offset.value};}`;
const context = {};
vm.createContext(context);
vm.runInContext(
  ts.transpileModule(code, {
    compilerOptions: { removeComments: true, target: ts.ScriptTarget.ES2022 },
  }).outputText,
  context,
  { timeout: 1000 }
);
const frames = [];
for (const translation of [-560, -60, 0, 20, 100, 900]) {
  for (const velocity of [-650, 0, 650]) {
    for (const sign of [-1, 1]) {
      for (const full of [false, true]) {
        for (const widths of [
          [160, 80],
          [0, 80],
        ]) {
          for (const origin of [-80, 0]) {
            const [start, end] = widths;
            const input = {
              end,
              full,
              origin,
              sign,
              start,
              translation,
              velocity,
            };
            context.input = input;
            const expected = vm.runInContext("frame(input)", context, {
              timeout: 1000,
            });
            frames.push({ expected, input });
          }
        }
      }
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/swipe-source.json", import.meta.url),
  `${JSON.stringify({ frames, sourceCommit: "b0aec40f8674dbe7f467be377bc3544359711ab0" }, null, 2)}\n`
);
