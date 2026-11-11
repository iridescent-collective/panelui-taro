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
  "packages/panelui/src/components/pyramid-chart/index.tsx"
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
let geometry;
const visit = (node) => {
  if (ts.isFunctionDeclaration(node) && node.name?.text === "geometry") {
    geometry = node.getText(parsed);
  }
  if (ts.isVariableDeclaration(node)) {
    if (node.name.getText(parsed) === "build") {
      build = node.initializer.getText(parsed);
    }
    if (
      node.name.getText(parsed) === "extentMax" &&
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
const niceDomain = mathParsed.statements
  .find(
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === "niceDomain"
  )
  ?.getText(mathParsed);
if (!build || !extent || !barPath || !geometry || !niceDomain) {
  throw new Error("Missing source builder");
}
const js = ts
  .transpileModule(
    `${barPath.replace("export function", "function")}\n${niceDomain.replace("export function", "function")}\n${geometry}\nconst DOMAIN_STEPS=4;function evaluate(o){const {values,plot,gutter,labelInset,barGap,barWidth,radius,minBarLength,fadedOpacity,side,loading}=o;const total=values.length;const towards=side==="start"?"left":"right";const domainMax={value:o.max};const reveal={value:o.grow};const activeIndex={value:o.active};return (${build})(o.wantActive)();}\nfunction domain(data,seriesKeys,maxValue){return (${extent})();}`,
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
  for (const side of ["start", "end"]) {
    for (const gutter of [0, 72]) {
      for (const grow of [0, 0.35, 1]) {
        for (const active of [-1, 1]) {
          for (const wantActive of [false, true]) {
            const input = {
              active,
              barGap: 0.25,
              barWidth: 12,
              fadedOpacity: 0.3,
              grow,
              gutter,
              labelInset: gutter ? 0 : 20,
              loading: false,
              max: 40,
              minBarLength: 3,
              plot: { height: 116, left: 44, top: 12, width: 246 },
              radius: 4,
              side,
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
    for (const maxValue of [undefined, 73]) {
      const context = vm.createContext({
        data,
        maxValue,
        seriesKeys: keys.join("|"),
      });
      const expected = vm.runInContext(
        `${js}\ndomain(data,seriesKeys,maxValue);`,
        context,
        { timeout: 1000 }
      );
      domains.push({ data, expected, keys, maxValue });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/pyramid-chart-source.json", import.meta.url),
  `${JSON.stringify({ domains, frames }, null, 2)}\n`
);
