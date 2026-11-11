import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  throw new Error("Provide pinned source checkout");
}
const relative = "packages/panelui/src/components/ring-chart/index.tsx";
const source = fs.readFileSync(path.join(sourceRoot, relative), "utf-8");
if (
  source !==
  execFileSync(
    "git",
    [
      "-C",
      sourceRoot,
      "show",
      `b0aec40f8674dbe7f467be377bc3544359711ab0:${relative}`,
    ],
    { encoding: "utf-8" }
  )
) {
  throw new Error("Source differs from pinned commit");
}
const parsed = ts.createSourceFile(
  "ring.tsx",
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
let radiusFactory;
const visit = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    node.name.getText(parsed) === "radiusOf" &&
    node.initializer &&
    ts.isCallExpression(node.initializer)
  ) {
    radiusFactory = node.initializer.arguments[0].getText(parsed);
  }
  ts.forEachChild(node, visit);
};
visit(parsed);
const ring = parsed.statements.find(
  (node) =>
    ts.isFunctionDeclaration(node) && node.name?.text === "RingChartRing"
);
const names = new Set([
  "datum",
  "radius",
  "circumference",
  "arcLength",
  "ticks",
  "slot",
  "dash",
  "cap",
  "fraction",
  "clamped",
  "count",
  "start",
  "trackDash",
]);
const declarations = [];
let props;
for (const statement of ring?.body?.statements ?? []) {
  if (!ts.isVariableStatement(statement)) {
    continue;
  }
  for (const declaration of statement.declarationList.declarations) {
    const name = declaration.name.getText(parsed);
    if (names.has(name)) {
      declarations.push(`const ${declaration.getText(parsed)};`);
    }
    if (name === "props" && ts.isCallExpression(declaration.initializer)) {
      props = declaration.initializer.arguments[0].getText(parsed);
    }
  }
}
if (!radiusFactory || !props) {
  throw new Error("Missing source geometry");
}
const code = `function evaluate(input){const {strokeWidth,ringGap,index,arc,segments,segmentGap,lineCap}=input;const box=input.size;const data=Array.from({length:input.count},()=>input.datum);const reveal={value:input.reveal};const radiusOf=(${radiusFactory})();${declarations.join("\n")}return {radius,cap,trackDash,progressDash:(${props})().strokeDasharray};}`;
const js = ts.transpileModule(code, {
  compilerOptions: { removeComments: true, target: ts.ScriptTarget.ES2022 },
}).outputText;
const frames = [];
for (const size of [160, 240]) {
  for (const segments of [undefined, 12]) {
    for (const arc of [0, 0.5, 1]) {
      for (const value of [0, 50, 120]) {
        for (const reveal of [0, 0.5, 1]) {
          for (const index of [0, 1, 2]) {
            const input = {
              arc,
              count: 3,
              datum: { label: "Goal", maxValue: 100, value },
              index,
              reveal,
              ringGap: 6,
              segmentGap: 3,
              segments,
              size,
              strokeWidth: 12,
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
fs.writeFileSync(
  new URL("../test/fixtures/ring-chart-source.json", import.meta.url),
  `${JSON.stringify(frames, null, 2)}\n`
);
