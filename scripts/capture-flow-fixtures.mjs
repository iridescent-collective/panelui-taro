import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const root = process.argv[2] ?? "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const load = (name) => {
  const relative = `packages/panelui/src/components/flow/${name}.ts`;
  const source = fs.readFileSync(path.join(root, relative), "utf-8");
  if (
    source !==
    execFileSync("git", ["show", `${commit}:${relative}`], {
      cwd: root,
      encoding: "utf-8",
    })
  ) {
    throw new Error("Flow source differs from pinned revision");
  }
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(js, { exports });
  return exports;
};
const paths = load("flow-paths");
const identifiers = load("flow-identifiers");
const access = load("flow-accessibility");
const sides = ["top", "right", "bottom", "left"];
const variants = ["bezier", "smoothstep", "step", "straight"];
const edges = [];
for (const variant of variants) {
  for (const fromSide of sides) {
    for (const toSide of sides) {
      for (const to of [
        { x: 220, y: 160 },
        { x: -90, y: 12 },
        { x: 20, y: 20 },
      ]) {
        const args = [
          variant,
          { x: 20, y: 20 },
          fromSide,
          to,
          toSide,
          0.25,
          8,
          20,
        ];
        edges.push({
          args,
          arrival: paths.arrivalDirection(variant, args[1], to, toSide),
          result: paths.edgePath(...args),
        });
      }
    }
  }
}
const anchors = [];
for (const side of sides) {
  for (const offset of [-0.2, 0, 0.5, 1, 1.2]) {
    const args = [{ height: 80, width: 160, x: -30, y: 20 }, side, offset];
    anchors.push({ args, result: paths.anchorOf(...args) });
  }
}
const moves = [];
for (const action of [
  ...access.FLOW_MOVE_ACTIONS.map((a) => a.name),
  "unknown",
]) {
  for (const bounds of [null, { height: 60, width: 100, x: 0, y: 0 }]) {
    const args = [{ height: 25, width: 40, x: 20, y: 15 }, bounds, action, 24];
    moves.push({
      args,
      result:
        access.moveNodePosition(args[0], bounds ?? undefined, action, 24) ??
        null,
    });
  }
}
const keys = [];
for (const node of ["a", "a.b", "__proto__", "中文"]) {
  for (const handle of ["out", "a.b", '"']) {
    const encoded = identifiers.encodeFlowHandleKey(node, handle);
    keys.push({
      decoded: identifiers.decodeFlowHandleKey(encoded),
      encoded,
      handle,
      node,
    });
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/flow-source.json", import.meta.url),
  `${JSON.stringify({ anchors, commit, edges, keys, moves }, null, 2)}\n`
);
