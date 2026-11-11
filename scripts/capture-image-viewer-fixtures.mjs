import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
const relative =
  "packages/panelui/src/components/image-viewer/image-viewer-geometry.ts";
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
const sandbox = { exports: {} };
vm.createContext(sandbox);
vm.runInContext(
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  sandbox,
  { timeout: 1000 }
);
const geometry = sandbox.exports;
const frames = [];
for (const offset of [-1600, -800, -120, 0, 40, 150]) {
  for (const velocity of [-800, -100, 0, 100, 800]) {
    for (const page of [0, 1, 3]) {
      const input = { offset, page, velocity };
      frames.push({
        input,
        output: {
          dismiss: geometry.shouldDismiss(offset, velocity),
          fade: geometry.dragFade(offset, 812),
          scale: geometry.dragScale(offset, 812),
          snap: geometry.snapPage(offset, velocity, page, 4, 391),
        },
      });
    }
  }
}
const fits = [];
for (const image of [
  { height: 0, width: 0 },
  { height: 800, width: 1000 },
  { height: 900, width: 300 },
]) {
  for (const scale of [0.5, 1, 2.5, 4, 5]) {
    const box = { height: 712, width: 343, x: 16, y: 50 };
    const fit = geometry.fitWithin(image, box);
    fits.push({
      box,
      image,
      output: {
        boundX: geometry.panBound(fit.width, scale, 375),
        cover: geometry.coverSize(image, box),
        fit,
        focal: geometry.focalTranslation(75, 30, 1.5, scale),
        hit: geometry.hitsRect(150, 300, fit, scale, 0, 20),
        rubber: geometry.rubberBandClamp(scale, 1, 4, 4),
      },
      scale,
    });
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/image-viewer-source.json", import.meta.url),
  `${JSON.stringify({ fits, frames, pinned }, null, 2)}\n`
);
