import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
const relative = "packages/panelui/src/components/fab/index.tsx";
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
const names = new Set(["STAGGER", "SIZE_PX", "GROUP_GAP", "MENU_METRICS"]);
const declarations = parsed.statements
  .filter(
    (node) =>
      (ts.isFunctionDeclaration(node) &&
        ["slotProgress", "settled", "menuOrigin"].includes(node.name.text)) ||
      (ts.isVariableStatement(node) &&
        node.declarationList.declarations.some((declaration) =>
          names.has(declaration.name.getText(parsed))
        ))
  )
  .map((node) => node.getText(parsed))
  .join("\n");
const sandbox = {
  Easing: {
    cubic: (value) => value ** 3,
    out: (easing) => (value) => 1 - easing(1 - value),
  },
  Extrapolation: { CLAMP: "clamp" },
  interpolate: (value, input, output) =>
    output[0] +
    Math.min(1, Math.max(0, (value - input[0]) / (input[1] - input[0]))) *
      (output[1] - output[0]),
};
vm.createContext(sandbox);
vm.runInContext(
  ts.transpileModule(declarations, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText,
  sandbox,
  { timeout: 1000 }
);
const slots = [];
for (const count of [1, 3, 5]) {
  for (let index = 0; index < count; index += 1) {
    for (const progress of [-0.1, 0, 0.04, 0.1, 0.3, 0.7, 1, 1.15]) {
      const output = sandbox.slotProgress(progress, count, index);
      slots.push({
        count,
        index,
        output,
        progress,
        settled: sandbox.settled(output),
      });
    }
  }
}
const origins = [];
for (const placement of ["bottom-left", "bottom-center", "bottom-right"]) {
  for (const appearance of ["platform", "wells"]) {
    for (const size of ["sm", "md", "lg"]) {
      for (const count of [0, 3]) {
        const width =
          sandbox.MENU_METRICS?.[appearance]?.width ??
          (appearance === "platform" ? 250 : 224);
        const output = vm.runInContext(
          `menuOrigin(${JSON.stringify(placement)}, MENU_METRICS[${JSON.stringify(appearance)}], ${width}, ${count}, ${JSON.stringify(size)})`,
          sandbox
        );
        origins.push({ appearance, count, output, placement, size, width });
      }
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/fab-source.json", import.meta.url),
  `${JSON.stringify({ origins, pinned, slots }, null, 2)}\n`
);
