import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  throw new Error("Provide pinned source checkout");
}
const pin = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const readPinned = (relative) => {
  const text = fs.readFileSync(path.join(sourceRoot, relative), "utf-8");
  if (
    text !==
    execFileSync("git", ["-C", sourceRoot, "show", `${pin}:${relative}`], {
      encoding: "utf-8",
    })
  ) {
    throw new Error("Source differs from pinned commit");
  }
  return text;
};
const source = readPinned(
  "packages/panelui/src/components/bar-chart/index.tsx"
);
const math = readPinned("packages/panelui/src/utils/chart.ts");
const parsed = ts.createSourceFile(
  "bar.tsx",
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
let build;
let extent;
const visit = (node) => {
  if (ts.isVariableDeclaration(node)) {
    if (node.name.getText(parsed) === "build") {
      build = node.initializer.getText(parsed);
    }
    if (
      node.name.getText(parsed) === "extent" &&
      ts.isCallExpression(node.initializer)
    ) {
      extent = node.initializer.arguments[0].getText(parsed);
    }
  }
  ts.forEachChild(node, visit);
};
visit(parsed);
const mathParsed = ts.createSourceFile(
  "chart.ts",
  math,
  ts.ScriptTarget.Latest,
  true
);
const barPath = mathParsed.statements
  .find(
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === "barPath"
  )
  ?.getText(mathParsed);
if (!build || !extent || !barPath) {
  throw new Error("Missing source builder");
}
const js = ts
  .transpileModule(
    `${barPath.replace("export function", "function")}\nfunction evaluate(o){const {values,baselines,plot,horizontal,stacked,barGap,barWidth,stackGap,radius,minBarLength,fadedOpacity,seriesIndex,seriesCount,loading}=o;const total=values.length;const domainMin={value:o.min};const domainMax={value:o.max};const reveal={value:o.grow};const activeIndex={value:o.active};return (${build})(o.wantActive)();}\nfunction domain(data,seriesKeys,stacked,yDomain){return (${extent})();}`,
    {
      compilerOptions: {
        module: ts.ModuleKind.None,
        removeComments: true,
        target: ts.ScriptTarget.ES2022,
      },
    }
  )
  .outputText.replace("export function barPath", "function barPath");
const frames = [];
for (const values of [[10, 20, null, -5], [], [0], [7]]) {
  for (const horizontal of [false, true]) {
    for (const stacked of [false, true]) {
      for (const grow of [0, 0.35, 1]) {
        for (const active of [-1, 1]) {
          for (const wantActive of [false, true]) {
            const input = {
              active,
              barGap: 0.2,
              barWidth: 12,
              baselines: stacked ? values.map(() => 3) : undefined,
              fadedOpacity: 0.3,
              grow,
              horizontal,
              loading: false,
              max: 40,
              min: -10,
              minBarLength: 3,
              plot: { height: 116, left: 44, top: 12, width: 246 },
              radius: 4,
              seriesCount: 2,
              seriesIndex: 1,
              stackGap: 2,
              stacked,
              values,
              wantActive,
            };
            const context = vm.createContext({ input });
            const expected = vm.runInContext(
              `${js}\nevaluate(input);`,
              context,
              { timeout: 1000 }
            );
            frames.push({ expected, input });
          }
        }
      }
    }
  }
}
const domains = [];
for (const data of [
  [],
  [
    { a: 10, b: 20 },
    { a: 20, b: 40 },
  ],
  [
    { a: -5, b: 20 },
    { a: -10, b: 40 },
  ],
  [{ a: 0, b: 0 }],
  [{ a: null, b: 7 }],
]) {
  for (const keys of [[], ["a"], ["a", "b"]]) {
    for (const stacked of [false, true]) {
      const context = vm.createContext({
        data,
        seriesKeys: keys.join("|"),
        stacked,
      });
      const expected = vm.runInContext(
        `${js}\ndomain(data,seriesKeys,stacked);`,
        context,
        { timeout: 1000 }
      );
      domains.push({ data, expected, keys, stacked });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/bar-chart-source.json", import.meta.url),
  `${JSON.stringify({ domains, frames }, null, 2)}\n`
);
