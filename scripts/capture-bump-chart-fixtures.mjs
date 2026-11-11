import { execFileSync } from "node:child_process";
import fs from "node:fs";
import vm from "node:vm";

import ts from "typescript";

const root = "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const read = (path) => {
  const source = fs.readFileSync(`${root}/${path}`, "utf-8");
  if (
    source !==
    execFileSync("git", ["-C", root, "show", `${commit}:${path}`], {
      encoding: "utf-8",
    })
  ) {
    throw new Error("Unpinned source");
  }
  return source;
};
const collect = (path, names) => {
  const source = read(path);
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
  collect("packages/panelui/src/components/bump-chart/index.tsx", [
    "bumpRanks",
    "rankFractions",
    "pointsAt",
  ]) +
  collect("packages/panelui/src/utils/chart.ts", [
    "xOf",
    "bumpSegment",
    "dotsPath",
  ]) +
  collect("packages/panelui/src/primitives/finite-chart.ts", [
    "finiteChartNumber",
  ]);
const js = ts.transpileModule(code, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
const data = [
  { a: 1, b: 2, c: 3, date: "W1" },
  { a: 2, b: 1, c: null, date: "W2" },
  { a: 3, b: 2, c: 1, date: "W3" },
  { a: null, b: 2, c: 1, date: "W4" },
];
const rankings = [];
for (const rows of [
  data,
  [],
  [
    { a: 8, b: 8, c: Number.NaN },
    { a: -2, b: Infinity, c: 0 },
  ],
  [{ a: 1, b: null }],
]) {
  for (const keys of [
    ["a", "b", "c"],
    ["c", "b", "a"],
  ]) {
    for (const values of ["rank", "score"]) {
      const ranks = vm.runInNewContext(
        `${js};bumpRanks(data,keys,{values})`,
        { data: rows, keys, values },
        { timeout: 1000 }
      );
      rankings.push({ data: rows, expected: ranks, keys, values });
    }
  }
}
const frames = [];
for (const key of ["a", "b", "c", "missing"]) {
  for (const progress of [0, 0.15, 0.5, 0.85, 1]) {
    for (const rows of [1, 3, 5]) {
      const from = vm.runInNewContext(
        `${js};rankFractions(bumpRanks(data,keys),3)`,
        { data, keys: ["a", "b", "c"] }
      );
      const to = vm.runInNewContext(
        `${js};rankFractions(bumpRanks(data,keys),rows)`,
        { data: data.toReversed(), keys: ["a", "b", "c"], rows }
      );
      const plot = { height: 136, left: 42, top: 8, width: 162 };
      const result = vm.runInNewContext(
        `${js};const runs=pointsAt(key,from,to,progress,plot);({runs,line:runs.map(bumpSegment).join(' '),dots:runs.map(run=>dotsPath(run,2.5)).join('')})`,
        { from, key, plot, progress, to },
        { timeout: 1000 }
      );
      frames.push({ expected: result, from, key, plot, progress, to });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/bump-chart-source.json", import.meta.url),
  `${JSON.stringify({ commit, frames, rankings }, null, 2)}\n`
);
