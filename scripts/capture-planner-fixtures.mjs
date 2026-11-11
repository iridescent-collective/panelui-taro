import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const root = process.argv[2] ?? "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const load = (name) => {
  const relative = `packages/panelui/src/components/planner/${name}.ts`;
  const source = fs.readFileSync(path.join(root, relative), "utf-8");
  if (
    source !==
    execFileSync("git", ["show", `${commit}:${relative}`], {
      cwd: root,
      encoding: "utf-8",
    })
  ) {
    throw new Error("Planner source differs from pinned revision");
  }
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports },
    { timeout: 1000 }
  );
  return exports;
};
const entries = load("planner-entries");
const weeks = load("planner-weeks");
const today = load("planner-today");
const nav = load("planner-grid-navigation");
const overflow = [];
for (const count of [0, 1, 2, 3, 8]) {
  for (const limit of [-1, 0, 1, 2.5, 3, 20]) {
    overflow.push({
      count,
      limit,
      result: entries.visibleEntries(
        Array.from({ length: count }, (_, index) => index),
        limit
      ),
    });
  }
}
const navigation = [];
for (const key of [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "Escape",
]) {
  for (const index of [0, 1, 6, 7, 20, 35, 40, 41]) {
    for (const sparse of [false, true]) {
      navigation.push({
        index,
        key,
        result: nav.plannerGridTarget(
          key,
          index,
          42,
          7,
          sparse ? (i) => i >= 3 && i <= 37 : undefined
        ),
        sparse,
      });
    }
  }
}
const dateParts = (date) => [
  date.getFullYear(),
  date.getMonth(),
  date.getDate(),
  date.getHours(),
];
const ranges = [];
for (const input of [
  [2026, 0, 31],
  [2026, 2, 10],
  [2026, 9, 1],
  [2028, 1, 29],
]) {
  for (const start of [0, 1, 6, -1, 8]) {
    const date = new Date(...input);
    const range = weeks.weekRange(date, start, 2, 3);
    ranges.push({
      anchor: dateParts(weeks.weekAnchor(range[2])),
      index: weeks.weekIndex(range, date, start),
      input,
      result: range.map(dateParts),
      start,
    });
  }
}
const midnight = [
  [2026, 9, 14, 0, 0, 0],
  [2026, 9, 14, 23, 59, 59],
  [2026, 1, 28, 12, 0, 0],
].map((input) => ({
  input,
  result: today.millisecondsUntilNextLocalDay(new Date(...input)),
}));
fs.writeFileSync(
  new URL("../test/fixtures/planner-source.json", import.meta.url),
  `${JSON.stringify({ commit, midnight, navigation, overflow, ranges }, null, 2)}\n`
);
