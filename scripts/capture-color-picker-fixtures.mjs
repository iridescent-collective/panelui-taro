import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
const relative = "packages/panelui/src/components/color-picker/index.tsx";
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
const callbacks = {};
let track = "";
const visit = (node) => {
  if (ts.isFunctionDeclaration(node) && node.name?.text === "trackFraction") {
    track = node.getText(parsed);
  }
  if (
    ts.isVariableDeclaration(node) &&
    ["ColorPickerArea", "ColorPickerWheel"].includes(node.name.getText(parsed))
  ) {
    const name = node.name.getText(parsed);
    const inner = (child) => {
      if (
        ts.isVariableDeclaration(child) &&
        child.name.getText(parsed) === "apply"
      ) {
        callbacks[name] = child.initializer.getText(parsed);
      }
      ts.forEachChild(child, inner);
    };
    inner(node);
  }
  ts.forEachChild(node, visit);
};
visit(parsed);
const code = `${track}\nfunction frame(input){const sign=input.sign;const width={value:input.width};const boxHeight=input.height;const radius=input.diameter/2;const ctx={hue:{value:30},saturation:{value:.7},brightness:{value:.8},opacity:{value:.6},haptics:false,emit:()=>{}};const runOnJS=f=>f;const settle=()=>{};const selectionTick=()=>{};(${callbacks.ColorPickerArea})(input.x,input.y,false);const area={s:ctx.saturation.value,v:ctx.brightness.value};(${callbacks.ColorPickerWheel})(input.x,input.y,false);return {area,wheel:{h:ctx.hue.value,s:ctx.saturation.value},track:trackFraction(input.x,input.width,input.thumb,input.sign)};}`;
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  ts.transpileModule(code, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText,
  sandbox,
  { timeout: 1000 }
);
const frames = [];
for (const sign of [-1, 1]) {
  for (const width of [0, 180, 320]) {
    for (const [x, y] of [
      [-20, -15],
      [0, 0],
      [13, 25],
      [90, 90],
      [150, 210],
      [340, 250],
    ]) {
      for (const thumb of [22, 26, 30]) {
        const input = { diameter: 240, height: 180, sign, thumb, width, x, y };
        frames.push({ input, output: sandbox.frame(input) });
      }
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/color-picker-source.json", import.meta.url),
  `${JSON.stringify({ frames, pinned }, null, 2)}\n`
);
