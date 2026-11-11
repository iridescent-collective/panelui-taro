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
const source = read("packages/panelui/src/components/sankey-chart/index.tsx");
const ast = ts.createSourceFile("s.tsx", source, 99, true, ts.ScriptKind.TSX);
let placements;
let ribbon;
let bar;
const visit = (n) => {
  if (ts.isVariableDeclaration(n) && n.name.getText(ast) === "placements") {
    placements = n.initializer.arguments[0].getText(ast);
  }
  if (
    ts.isFunctionDeclaration(n) &&
    ["Ribbon", "NodeBar"].includes(n.name?.text)
  ) {
    const inspect = (node) => {
      if (
        ts.isVariableDeclaration(node) &&
        node.name.getText(ast) === "animatedProps"
      ) {
        if (n.name.text === "Ribbon") {
          ribbon = node.initializer.arguments[0].getText(ast);
        } else {
          bar = node.initializer.arguments[0].getText(ast);
        }
      }
      ts.forEachChild(node, inspect);
    };
    inspect(n);
  }
  ts.forEachChild(n, visit);
};
visit(ast);
const util = ts.createSourceFile(
  "u.ts",
  read("packages/panelui/src/utils/chart.ts"),
  99,
  true
);
const functions =
  ast.statements
    .filter((n) => ["progress", "nameWidth"].includes(n.name?.text))
    .map((n) => n.getText(ast))
    .join("\n") +
  util.statements
    .filter((n) => ["flowPath", "flowPathVertical"].includes(n.name?.text))
    .map((n) => n.getText(util))
    .join("\n");
const code = `${read("packages/panelui/src/components/sankey-chart/sankey-layout.ts") + functions}const LABEL_GAP=6,LABEL_LINE=20;function labelModel(layout,width,height,upright,showValue){const drawing=true,minHeight=6;const labelFor=id=>id;return (${placements})();}function ribbonModel(o){const {edgeFrom,edgeTo,centreFrom,centreTo,thickness,curve,upright,windowFrom,windowTo}=o;const reveal={value:o.clock},settled={value:o.opacity};return (${ribbon})();}function barModel(o){const {thin0,thin1,long0,long1,upright,from,to}=o;const extent=long1-long0,centre=(long0+long1)/2,thickness=thin1-thin0,reveal={value:o.clock},settled={value:o.opacity};return (${bar})();}`;
const js = ts.transpileModule(code, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const graphs = [
  {
    links: [
      { source: "Source", target: "Middle", value: 100 },
      { source: "Middle", target: "Sink", value: 100 },
    ],
    nodes: [{ id: "Middle" }, { id: "Sink" }, { id: "Source" }],
  },
  {
    links: [
      { source: "A", target: "B", value: 80 },
      { source: "A", target: "C", value: 20 },
      { source: "B", target: "D", value: 70 },
      { source: "C", target: "D", value: 20 },
    ],
    nodes: [{ id: "A" }, { id: "B" }, { id: "C" }, { id: "D" }],
  },
  {
    links: [
      { source: "A", target: "B", value: 40 },
      { source: "B", target: "C", value: 30 },
      { source: "C", target: "A", value: 12 },
      { source: "A", target: "missing", value: 3 },
      { source: "A", target: "A", value: 5 },
      { source: "A", target: "C", value: 0 },
    ],
    nodes: [{ id: "A" }, { id: "B" }, { id: "A" }, { id: "C", value: 120 }],
  },
  {
    links: Array.from({ length: 8 }, (_, i) => ({
      source: "Source",
      target: `Target ${i}`,
      value: 50 / (i + 1),
    })),
    nodes: [
      { id: "Source" },
      ...Array.from({ length: 8 }, (_, i) => ({ id: `Target ${i}` })),
    ],
  },
  { links: [], nodes: [] },
  { links: [], nodes: [{ id: "Empty" }] },
];
const layouts = [];
const labels = [];
for (const graph of graphs) {
  for (const align of ["justify", "left", "right", "center"]) {
    for (const iterations of [0, 6]) {
      for (const collapse of [
        undefined,
        { label: "Other", maxPerColumn: 3, minShare: 0.03 },
      ]) {
        const options = {
          align,
          collapse,
          height: 240,
          iterations,
          nodePadding: 14,
          nodeWidth: 10,
          width: 300,
        };
        const expected = vm.runInNewContext(
          `${js};sankeyLayout(nodes,links,options)`,
          { ...graph, exports: {}, options },
          { timeout: 1000 }
        );
        layouts.push({ ...graph, expected, options });
        for (const upright of [true, false]) {
          for (const showValue of [false, true]) {
            const input = upright
              ? expected
              : vm.runInNewContext(
                  `${js};transposeLayout(layout)`,
                  { exports: {}, layout: expected },
                  { timeout: 1000 }
                );
            const width = upright ? 300 : 240;
            const height = upright ? 240 : 300;
            const result = vm.runInNewContext(
              `${js};labelModel(layout,width,height,upright,showValue)`,
              { exports: {}, height, layout: input, showValue, upright, width },
              { timeout: 1000 }
            );
            labels.push({
              expected: result,
              height,
              layout: input,
              showValue,
              upright,
              width,
            });
          }
        }
      }
    }
  }
}
const frames = [];
for (const upright of [true, false]) {
  for (const clock of [0, 0.15, 0.4, 0.8, 1]) {
    for (const opacity of [0.08, 0.4, 0.78]) {
      const input = {
        centreFrom: 70,
        centreTo: 180,
        clock,
        curve: 0.5,
        edgeFrom: 10,
        edgeTo: 290,
        from: 0.2,
        long0: 24,
        long1: 142,
        opacity,
        thickness: 32,
        thin0: 12,
        thin1: 22,
        to: 0.85,
        upright,
        windowFrom: 0.2,
        windowTo: 0.85,
      };
      const expected = vm.runInNewContext(
        `${js};({ribbon:ribbonModel(input),bar:barModel(input)})`,
        { exports: {}, input },
        { timeout: 1000 }
      );
      frames.push({ expected, input });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/sankey-chart-source.json", import.meta.url),
  `${JSON.stringify({ commit, frames, labels, layouts }, null, 2)}\n`
);
