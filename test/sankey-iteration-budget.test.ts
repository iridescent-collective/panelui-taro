import fs from "node:fs";
import vm from "node:vm";

import ts from "typescript";
import { expect, it } from "vitest";

const source = fs.readFileSync(
  new URL("../src/components/SankeyChart/sankey-layout.ts", import.meta.url),
  "utf-8"
);
const ast = ts.createSourceFile(
  "sankey-layout.ts",
  source,
  ts.ScriptTarget.ES2017,
  true
);
const moduleSource = ast.statements
  .filter((node) => !ts.isImportDeclaration(node))
  .map((node) => node.getText(ast))
  .join("\n");
const code = ts.transpileModule(
  `const sortCopy = (items, compare) => items.slice().sort(compare);\n${moduleSource}`,
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2017,
    },
  }
).outputText;
const execute = (iterations: number, empty = false) => {
  const context = {
    exports: {},
    iterations,
    links: empty
      ? []
      : [{ source: "Source", target: "Destination", value: 100 }],
    nodes: empty ? [] : [{ id: "Source" }, { id: "Destination" }],
  };
  try {
    return vm.runInNewContext(
      `${code}\nlet result; try { result = exports.sankeyLayout(nodes, links, {width:300,height:240,nodeWidth:10,nodePadding:14,align:"justify",iterations}); } catch(error) { result = {name:error.name,message:error.message}; } result;`,
      context,
      { timeout: 100 }
    );
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    return { message: error.message, name: error.name };
  }
};
it.each([
  Infinity,
  -Infinity,
  Number.NaN,
  -1,
  -0.01,
  64.01,
  65,
  Number.MAX_VALUE,
])("rejects unsafe iterations %s within a VM watchdog", (iterations) => {
  expect(execute(iterations)).toEqual({
    message: "SankeyChart iterations must be a finite number between 0 and 64",
    name: "RangeError",
  });
});
it("validates before the empty-layout fast path", () => {
  expect(execute(Infinity, true)).toEqual({
    message: "SankeyChart iterations must be a finite number between 0 and 64",
    name: "RangeError",
  });
});
it.each([0, 6, 64])("accepts bounded iteration count %s", (iterations) => {
  expect(execute(iterations)).toMatchObject({
    columns: 2,
    dropped: 0,
    nodes: [
      { id: "Source", value: 100 },
      { id: "Destination", value: 100 },
    ],
  });
});
it("retains upstream flooring for bounded fractional iterations", () => {
  expect(execute(6.9)).toEqual(execute(6));
});
