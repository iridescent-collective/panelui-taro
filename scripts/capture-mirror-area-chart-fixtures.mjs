import { execFileSync } from "node:child_process";
import fs from "node:fs";
import vm from "node:vm";

import ts from "typescript";

const root = "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const collect = (path, names) => {
  const source = fs.readFileSync(`${root}/${path}`, "utf-8");
  if (
    source !==
    execFileSync("git", ["-C", root, "show", `${commit}:${path}`], {
      encoding: "utf-8",
    })
  ) {
    throw new Error("Unpinned source");
  }
  const ast = ts.createSourceFile(
    "source.tsx",
    source,
    99,
    true,
    ts.ScriptKind.TSX
  );
  return ast.statements
    .filter((n) => names.includes(n.name?.text))
    .map((n) => n.getText(ast).replace("export function", "function"))
    .join("\n");
};
const code =
  collect("packages/panelui/src/components/mirror-area-chart/index.tsx", [
    "edgeRuns",
    "edgePath",
    "fillPath",
    "sideExtent",
  ]) +
  collect("packages/panelui/src/utils/chart.ts", [
    "xOf",
    "tangents",
    "segment",
  ]);
const js = ts.transpileModule(code, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
const frames = [];
for (const values of [[12, 24, 8, null, 18, -4], [0], [null, null], []]) {
  for (const direction of [-1, 1]) {
    for (const grow of [0, 0.25, 0.6, 1]) {
      for (const curve of ["linear", "monotone"]) {
        const plot = { height: 136, left: 40, top: 12, width: 250 };
        const baseline = 86.8;
        const height = direction < 0 ? 74.8 : 61.2;
        const max = 30;
        const expected = vm.runInNewContext(
          `${js};const runs=edgeRuns(values,plot,baseline,height,max,grow,direction);({runs,edge:edgePath(runs,curve),fill:fillPath(runs,curve,baseline)})`,
          { baseline, curve, direction, grow, height, max, plot, values },
          { timeout: 1000 }
        );
        frames.push({
          baseline,
          curve,
          direction,
          expected,
          grow,
          height,
          max,
          plot,
          values,
        });
      }
    }
  }
}
const domains = [];
for (const data of [
  [
    { a: 12, b: 30 },
    { a: -1, b: Number.NaN },
  ],
  [],
  [{ a: 0, b: null }],
]) {
  for (const explicit of [undefined, [-5, 40], [-5, -1]]) {
    const keys = ["a", "b"];
    const expected = vm.runInNewContext(
      `${js};sideExtent(data,keys,explicit)`,
      { data, explicit, keys },
      { timeout: 1000 }
    );
    domains.push({ data, expected, explicit, keys });
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/mirror-area-chart-source.json", import.meta.url),
  `${JSON.stringify({ commit, domains, frames }, null, 2)}\n`
);
