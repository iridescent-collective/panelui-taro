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
  collect("packages/panelui/src/components/live-line-chart/index.tsx", [
    "runOf",
  ]) +
  collect("packages/panelui/src/utils/chart.ts", [
    "xAt",
    "yOf",
    "tangents",
    "segment",
  ]);
const js = ts.transpileModule(code, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
const frames = [];
const times = [1000, 3000, 4000, 9000, 13_000];
const values = [12, 18, 14, 30, 21];
for (const now of [2000, 5000, 10_000, 16_000, 25_000]) {
  for (const windowMs of [3000, 10_000]) {
    for (const curve of ["linear", "monotone"]) {
      const plot = { height: 116, left: 44, top: 12, width: 242 };
      const result = vm.runInNewContext(
        `${js};const run=runOf(times,values,plot,now-windowMs,now,10,35);({run,line:run.length>1?segment(run,curve):'',area:run.length>1?segment(run,curve)+' L'+run[run.length-1].x+','+(plot.top+plot.height)+' L'+run[0].x+','+(plot.top+plot.height)+' Z':''})`,
        { curve, now, plot, times, values, windowMs },
        { timeout: 1000 }
      );
      frames.push({
        curve,
        expected: result,
        now,
        plot,
        times,
        values,
        windowMs,
      });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/live-line-chart-source.json", import.meta.url),
  `${JSON.stringify({ commit, frames }, null, 2)}\n`
);
