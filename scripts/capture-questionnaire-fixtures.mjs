import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const root = process.argv[2] ?? "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const relative = "packages/panelui/src/components/questionnaire/index.tsx";
const source = fs.readFileSync(path.join(root, relative), "utf-8");
if (
  source !==
  execFileSync("git", ["show", `${commit}:${relative}`], {
    cwd: root,
    encoding: "utf-8",
  })
) {
  throw new Error("Questionnaire source differs from pinned revision");
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
const callbacks = {};
const body = file.statements.find(
  (node) =>
    ts.isFunctionDeclaration(node) && node.name.text === "QuestionnaireBody"
);
const walk = (node) => {
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ["onUpdate", "onEnd"].includes(node.expression.name.text)
  ) {
    callbacks[node.expression.name.text] = printer.printNode(
      ts.EmitHint.Expression,
      node.arguments[0],
      file
    );
  }
  ts.forEachChild(node, walk);
};
walk(body);
const gestures = [];
for (const width of [0, 300]) {
  for (const translation of [-300, -100, -75, -74, 0, 74, 75, 100, 300]) {
    for (const forward of [false, true]) {
      for (const back of [false, true]) {
        const drag = { value: 0 };
        let delta = 0;
        const context = {
          SWIPE_FRACTION: 0.25,
          canAdvance: forward,
          canRetreat: back,
          drag,
          navigate: (direction) => {
            delta = direction;
          },
          runOnJS: (fn) => fn,
          width,
          withSpring: (value) => value,
        };
        vm.runInNewContext(
          transpile(
            `this.update=${callbacks.onUpdate};this.end=${callbacks.onEnd};`
          ),
          context,
          { timeout: 1000 }
        );
        context.update({ translationX: translation });
        const offset = drag.value;
        context.end({ translationX: translation });
        gestures.push({ back, delta, forward, offset, translation, width });
      }
    }
  }
}
const utility = file.statements.filter(
  (node) =>
    ts.isFunctionDeclaration(node) &&
    ["isAnswered", "shortcutAt"].includes(node.name.text)
);
const context = {};
vm.runInNewContext(
  transpile(
    `${utility.map((node) => printer.printNode(ts.EmitHint.Unspecified, node, file)).join("\n")}\nthis.isAnswered=isAnswered;this.shortcutAt=shortcutAt;`
  ),
  context,
  { timeout: 1000 }
);
const answers = ["", "  ", "one", [], [""], ["one"], ["one", "two"]].map(
  (input) => ({ input, result: context.isAnswered(input) })
);
const shortcuts = [];
for (const mode of ["letters", "numbers"]) {
  for (const index of [0, 1, 8, 9, 25, 26, 30]) {
    shortcuts.push({ index, mode, result: context.shortcutAt(mode, index) });
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/questionnaire-source.json", import.meta.url),
  `${JSON.stringify({ answers, commit, gestures, shortcuts }, null, 2)}\n`
);
