import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const root = process.argv[2] ?? "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const relative = "packages/panelui/src/components/panelside/index.tsx";
const source = fs.readFileSync(path.join(root, relative), "utf-8");
if (
  source !==
  execFileSync("git", ["show", `${commit}:${relative}`], {
    cwd: root,
    encoding: "utf-8",
  })
) {
  throw new Error("Panelside source differs from pinned revision");
}
const file = ts.createSourceFile(
  relative,
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const printer = ts.createPrinter({ removeComments: true });
const transpile = (text) =>
  ts.transpileModule(text, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;
const findFunction = (name) =>
  file.statements.find(
    (node) => ts.isFunctionDeclaration(node) && node.name.text === name
  );
const calls = (node, method) => {
  const found = [];
  const walk = (child) => {
    if (ts.isCallExpression(child)) {
      let name = "";
      if (ts.isIdentifier(child.expression)) {
        name = child.expression.text;
      } else if (ts.isPropertyAccessExpression(child.expression)) {
        name = child.expression.name.text;
      }
      if (name === method) {
        found.push(child.arguments[0]);
      }
    }
    ts.forEachChild(child, walk);
  };
  walk(node);
  return found;
};
const expressions = {
  panel: printer.printNode(
    ts.EmitHint.Expression,
    calls(findFunction("PanelsidePanel"), "useAnimatedStyle")[0],
    file
  ),
  release: printer.printNode(
    ts.EmitHint.Expression,
    calls(findFunction("PanelsideRoot"), "onEnd")[0],
    file
  ),
  scene: printer.printNode(
    ts.EmitHint.Expression,
    calls(findFunction("PanelsideScene"), "useAnimatedStyle")[0],
    file
  ),
};
const scenes = [];
for (const p of [0, 0.25, 0.5, 0.95, 1, 1.1]) {
  for (const pushes of [false, true]) {
    for (const scale of [1, 0.92]) {
      for (const sign of [1, -1]) {
        for (const sceneWidth of [0, 375]) {
          const context = {
            GAP: 12,
            progress: { value: p },
            pushes,
            radius: 44,
            scale,
            sceneWidth,
            sign,
            width: 300,
          };
          vm.runInNewContext(
            transpile(`this.draw=${expressions.scene}`),
            context,
            { timeout: 1000 }
          );
          const drawn = context.draw();
          scenes.push({
            p,
            pushes,
            result: {
              radius: drawn.borderRadius,
              scale: drawn.transform[1].scale,
              x: drawn.transform[0].translateX,
            },
            scale,
            sceneWidth,
            sign,
          });
        }
      }
    }
  }
}
const panels = [];
for (const p of [0, 0.5, 0.95, 1]) {
  for (const docked of [false, true]) {
    for (const mode of ["push", "overlay"]) {
      const context = {
        PARALLAX: 0.18,
        docked,
        mode,
        progress: { value: p },
        width: 300,
      };
      vm.runInNewContext(transpile(`this.draw=${expressions.panel}`), context, {
        timeout: 1000,
      });
      panels.push({
        docked,
        mode,
        p,
        x: context.draw().transform[0].translateX,
      });
    }
  }
}
const releases = [];
for (const translation of [-100, -60, -6, 0, 6, 60, 100]) {
  for (const velocity of [-700, -500, 0, 500, 700]) {
    for (const sign of [1, -1]) {
      for (const open of [false, true]) {
        let next;
        const context = {
          COMMIT_DISTANCE: 60,
          COMMIT_VELOCITY: 500,
          MIN_OFFSET: 5,
          open,
          runOnJS: (fn) => fn,
          setOpen: (value) => {
            next = value;
          },
          settle: () => false,
          sign,
          tick: () => false,
        };
        vm.runInNewContext(
          transpile(`this.release=${expressions.release}`),
          context,
          { timeout: 1000 }
        );
        context.release({ translationX: translation, velocityX: velocity });
        releases.push({ next, open, sign, translation, velocity });
      }
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/panelside-source.json", import.meta.url),
  `${JSON.stringify({ commit, panels, releases, scenes }, null, 2)}\n`
);
