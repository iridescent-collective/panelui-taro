import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
const relative = "packages/panelui/src/components/tour/index.tsx";
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
const functions = parsed.statements
  .filter(
    (node) =>
      ts.isFunctionDeclaration(node) &&
      ["cardFrame", "spotlightFor", "cutoutPath"].includes(node.name?.text)
  )
  .map((node) => node.getText(parsed))
  .join("\n");
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(
  ts.transpileModule(
    `const SCREEN_MARGIN=16;const MAX_CARD_WIDTH=420;const CARD_OFFSET=12;${functions}`,
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } }
  ).outputText,
  sandbox,
  { timeout: 1000 }
);
const spots = [];
for (const shape of ["rect", "circle"]) {
  for (const padding of [0, 8, 16]) {
    for (const radius of [0, 12, 80]) {
      const rect = { height: 60, width: 120, x: 100, y: 150 };
      const output = sandbox.spotlightFor(rect, shape, padding, radius);
      spots.push({
        output,
        padding,
        path: sandbox.cutoutPath(
          375,
          667,
          output.x,
          output.y,
          output.width,
          output.height,
          output.radius
        ),
        radius,
        rect,
        shape,
      });
    }
  }
}
const frames = [];
for (const placement of ["auto", "top", "bottom"]) {
  for (const cardHeight of [null, 20, 180, 500]) {
    for (const spot of [
      null,
      { height: 40, width: 50, x: 100, y: 50 },
      { height: 40, width: 50, x: 100, y: 560 },
    ]) {
      for (const screenWidth of [375, 768]) {
        const input = {
          cardHeight,
          insets: { bottom: 34, left: 0, right: 0, top: 44 },
          placement,
          screenHeight: 667,
          screenWidth,
          spot,
        };
        frames.push({ input, output: sandbox.cardFrame(input) });
      }
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/tour-source.json", import.meta.url),
  `${JSON.stringify({ frames, pinned, spots }, null, 2)}\n`
);
