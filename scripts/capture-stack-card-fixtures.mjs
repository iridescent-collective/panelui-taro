import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
const relative =
  "packages/panelui/src/components/stack-card/stack-card-geometry.ts";
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
const sourceApi = sandbox.exports;
const frames = [];
for (const allowed of [
  ["left", "right"],
  ["up", "down"],
  ["left", "right", "up", "down"],
  [],
]) {
  for (const [x, y] of [
    [0, 0],
    [-100, 30],
    [20, 180],
    [300, -200],
  ]) {
    for (const [vx, vy] of [
      [0, 0],
      [-400, 80],
      [50, -650],
    ]) {
      for (const [width, height] of [
        [0, 0],
        [320, 420],
      ]) {
        const threshold = 0.3;
        frames.push({
          allowed,
          height,
          output: sourceApi.releasedDirection(
            allowed,
            x,
            y,
            vx,
            vy,
            width,
            height,
            threshold
          ),
          progress: sourceApi.releaseProgress(
            allowed,
            x,
            y,
            width,
            height,
            threshold
          ),
          threshold,
          vx,
          vy,
          width,
          x,
          y,
        });
      }
    }
  }
}
const exits = [];
for (const direction of ["left", "right", "up", "down"]) {
  for (const [x, y] of [
    [0, 0],
    [80, -60],
  ]) {
    exits.push({
      direction,
      output: sourceApi.exitTarget(direction, 320, 420, x, y),
      x,
      y,
    });
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/stack-card-source.json", import.meta.url),
  `${JSON.stringify({ exits, frames, pinned }, null, 2)}\n`
);
