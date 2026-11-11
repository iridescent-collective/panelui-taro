import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  throw new Error("Provide pinned source checkout");
}
const relative = "packages/panelui/src/components/area-chart/index.tsx";
const pin = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const source = fs.readFileSync(path.join(sourceRoot, relative), "utf-8");
if (
  source !==
  execFileSync("git", ["-C", sourceRoot, "show", `${pin}:${relative}`], {
    encoding: "utf-8",
  })
) {
  throw new Error("AreaChart source differs from pin");
}
const parsed = ts.createSourceFile(
  "area.tsx",
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
let extent;
const visit = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    node.name.getText(parsed) === "extent" &&
    node.initializer &&
    ts.isCallExpression(node.initializer) &&
    node.initializer.expression.getText(parsed) === "useMemo"
  ) {
    extent = node.initializer.arguments[0].getText(parsed);
  }
  ts.forEachChild(node, visit);
};
visit(parsed);
if (!extent) {
  throw new Error("Missing source extent function");
}
const js = ts.transpileModule(
  `const evaluate = (data,seriesKeys,stacked,yDomain) => (${extent})();`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }
).outputText;
const rows = [
  [],
  [{ a: 7, b: 2 }],
  [
    { a: 10, b: 20 },
    { a: 20, b: 40 },
  ],
  [
    { a: -10, b: 4 },
    { a: 12, b: -6 },
  ],
  [
    { a: null, b: 3 },
    { a: 10, b: null },
  ],
  [
    { a: 0, b: 0 },
    { a: 0, b: 0 },
  ],
  [{ date: "A" }, { date: "B" }],
  [
    { a: 10, b: 20 },
    { a: 10, b: 20 },
  ],
];
const fixtures = [];
for (const data of rows) {
  for (const stacked of [false, true]) {
    for (const keys of [[], ["a"], ["a", "b"]]) {
      const sandbox = vm.createContext({
        data,
        seriesKeys: keys.join("|"),
        stacked,
      });
      const expected = vm.runInContext(
        `${js}\nevaluate(data,seriesKeys,stacked);`,
        sandbox,
        { timeout: 1000 }
      );
      fixtures.push({ data, expected, keys, stacked });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/area-chart-source.json", import.meta.url),
  `${JSON.stringify(fixtures, null, 2)}\n`
);
