import { execFileSync } from "node:child_process";
import fs from "node:fs";
import vm from "node:vm";

import ts from "typescript";

const root = "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const path =
  "packages/panelui/src/components/message-scroller/message-scroller-math.ts";
const input = fs.readFileSync(`${root}/${path}`, "utf-8");
if (
  input !==
  execFileSync("git", ["-C", root, "show", `${commit}:${path}`], {
    encoding: "utf-8",
  })
) {
  throw new Error("Source mismatch");
}
const source = ts.transpileModule(input.replaceAll("export ", ""), {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
const scope = {};
vm.runInNewContext(source, scope, { timeout: 1000 });
const edges = [];
for (const contentHeight of [0, 100, 800]) {
  for (const viewportHeight of [0, 200, 1000]) {
    for (const offset of [-12, 0, 24, 24.1, 100, 800]) {
      for (const target of ["start", "end"]) {
        const distance = scope.distanceFromMessageScrollerTarget(
          target,
          offset,
          contentHeight,
          viewportHeight
        );
        edges.push({
          contentHeight,
          distance,
          offset,
          target,
          viewportHeight,
          visible: scope.isMessageScrollerTargetVisible(distance),
        });
      }
    }
  }
}
const navigation = [];
for (const items of [
  [],
  [{ messageId: "a" }],
  [
    { messageId: "a", scrollAnchor: true },
    { messageId: "b" },
    { messageId: "c", scrollAnchor: true },
  ],
]) {
  for (const position of ["start", "end", "last-anchor"]) {
    for (const visible of [0, 1, 2, 10]) {
      navigation.push({
        anchor: scope.messageScrollerAnchorAt(items, visible),
        indices: ["a", "b", "c", "missing"].map(
          (id) => scope.messageScrollerIndex(items, id) ?? null
        ),
        initial: scope.initialMessageScrollerIndex(items, position) ?? null,
        items,
        position,
        visible,
      });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/message-scroller-source.json", import.meta.url),
  `${JSON.stringify({ commit, edges, navigation }, null, 2)}\n`
);
