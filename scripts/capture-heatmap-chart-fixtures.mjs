import { execFileSync } from "node:child_process";
import fs from "node:fs";
import vm from "node:vm";

import ts from "typescript";

const root = "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const read = (path) => {
  const text = fs.readFileSync(`${root}/${path}`, "utf-8");
  if (
    text !==
    execFileSync("git", ["-C", root, "show", `${commit}:${path}`], {
      encoding: "utf-8",
    })
  ) {
    throw new Error("Unpinned source");
  }
  return text;
};
const source = read("packages/panelui/src/components/heatmap-chart/index.tsx");
const ast = ts.createSourceFile(
  "heatmap.tsx",
  source,
  99,
  true,
  ts.ScriptKind.TSX
);
const functions = [];
let grid;
let level;
const visit = (node) => {
  if (
    ts.isFunctionDeclaration(node) &&
    [
      "buildHeatmapCalendar",
      "deriveLevels",
      "dayKey",
      "defaultTooltipLabel",
    ].includes(node.name?.text)
  ) {
    functions.push(node.getText(ast).replace("export function", "function"));
  }
  if (
    ts.isVariableDeclaration(node) &&
    node.initializer &&
    ts.isCallExpression(node.initializer)
  ) {
    if (node.name.getText(ast) === "grid") {
      grid = node.initializer.arguments[0].getText(ast);
    }
    if (node.name.getText(ast) === "levelOf") {
      level = node.initializer.arguments[0].getText(ast);
    }
  }
  ts.forEachChild(node, visit);
};
visit(ast);
const utility = read("packages/panelui/src/utils/date.ts");
const parsed = ts.createSourceFile("date.ts", utility, 99, true);
for (const name of ["normalizeWeekStart", "startOfDay"]) {
  functions.push(
    parsed.statements
      .find(
        (node) => ts.isFunctionDeclaration(node) && node.name?.text === name
      )
      .getText(parsed)
      .replace("export function", "function")
  );
}
const js = ts.transpileModule(
  `${functions.join("\n")}const DAYS_IN_WEEK=7,MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function gridModel(data,width,axisWidth,layout,binSize,gap,rows){return (${grid})();}function levelsModel(data,counts){const thresholds=deriveLevels(data);const level=(${level})();return {thresholds,levels:counts.map(level)};}`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }
).outputText;
const grids = [];
for (const columns of [0, 1, 4, 52]) {
  for (const width of [0, 300]) {
    for (const axisWidth of [0, 26]) {
      for (const layout of ["fluid", "fill"]) {
        const input = {
          axisWidth,
          binSize: 12,
          data: Array.from({ length: columns }, (_, bin) => ({
            bin,
            bins: [],
          })),
          gap: 3,
          layout,
          rows: 7,
          width,
        };
        const expected = vm.runInNewContext(
          `${js}\ngridModel(data,width,axisWidth,layout,binSize,gap,rows)`,
          input,
          { timeout: 1000 }
        );
        grids.push({ expected, input });
      }
    }
  }
}
const levels = [];
for (const values of [
  [],
  [0, 0],
  [1, 1, 1, 1],
  [1, 3, 7, 10, 30, 80],
  [0, 5, 0, 20],
]) {
  const data = [{ bin: 0, bins: values.map((count, bin) => ({ bin, count })) }];
  const counts = [-1, 0, 0.1, 1, 3, 5, 7, 20, 100];
  const expected = vm.runInNewContext(
    `${js}\nlevelsModel(data,counts)`,
    { counts, data },
    { timeout: 1000 }
  );
  levels.push({ counts, data, expected });
}
const calendars = [];
for (const weekStartDay of [0, 1, 6]) {
  const input = {
    end: "2026-03-03T02:00:00",
    entries: [
      { count: 2, date: "2026-02-27T13:30:00" },
      { count: 3, date: "2026-02-27T17:00:00" },
      { count: 7, date: "2026-03-02T12:00:00" },
    ],
    start: "2026-02-26T17:00:00",
    weekStartDay,
  };
  const entries = input.entries.map((entry) => ({
    ...entry,
    date: new Date(entry.date),
  }));
  const options = {
    end: new Date(input.end),
    start: new Date(input.start),
    weekStartDay,
  };
  const expected = vm.runInNewContext(
    `${js}\nbuildHeatmapCalendar(entries,options)`,
    { entries, options },
    { timeout: 1000 }
  );
  calendars.push({ expected, input });
}
fs.writeFileSync(
  new URL("../test/fixtures/heatmap-chart-source.json", import.meta.url),
  `${JSON.stringify({ calendars, commit, grids, levels }, null, 2)}\n`
);
