import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const root = process.argv[2] ?? "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const printer = ts.createPrinter({ removeComments: true });
const sources = [];
const read = (relative) => {
  const source = fs.readFileSync(path.join(root, relative), "utf-8");
  if (
    source !==
    execFileSync("git", ["show", `${commit}:${relative}`], {
      cwd: root,
      encoding: "utf-8",
    })
  ) {
    throw new Error(`Source differs from pinned revision: ${relative}`);
  }
  sources.push(relative);
  return ts.createSourceFile(
    relative,
    source,
    ts.ScriptTarget.Latest,
    true,
    relative.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
};
const source = read("packages/panelui/src/components/plot/index.tsx");
const transpile = (text) =>
  ts.transpileModule(text, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const module = (file) => {
  const exports = {};
  const text = file.statements
    .filter((node) => !ts.isImportDeclaration(node))
    .map((node) => printer.printNode(ts.EmitHint.Unspecified, node, file))
    .join("\n");
  vm.runInNewContext(transpile(text), { exports });
  return exports;
};
const chart = module(read("packages/panelui/src/utils/chart.ts"));
const finite = module(read("packages/panelui/src/primitives/finite-chart.ts"));
const registry = module(
  read("packages/panelui/src/components/plot/plot-series-registry.ts")
);
const find = (node, predicate) => {
  let result;
  const walk = (child) => {
    if (result) {
      return;
    }
    if (predicate(child)) {
      result = child;
      return;
    }
    ts.forEachChild(child, walk);
  };
  walk(node);
  if (!result) {
    throw new Error("Source expression missing");
  }
  return result;
};
const variable = (node, name) =>
  find(
    node,
    (child) =>
      ts.isVariableDeclaration(child) &&
      ts.isIdentifier(child.name) &&
      child.name.text === name
  );
const fn = (name) =>
  find(
    source,
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === name
  );
const expression = (node) =>
  printer.printNode(ts.EmitHint.Expression, node, source);
const memo = (node, name) =>
  expression(variable(node, name).initializer.arguments[0]);
const run = (text, bindings) => {
  const context = { ...bindings };
  vm.runInNewContext(transpile(`globalThis.output=(${text})()`), context);
  return context.output;
};
const rootNode = variable(source, "PlotRoot");
const extentExpression = memo(rootNode, "extent");
const padExpression = expression(variable(rootNode, "pad").initializer);
const plotExpression = expression(variable(rootNode, "plot").initializer);
const padding = run(
  `()=>(${expression(variable(source, "PADDING").initializer)})`,
  {}
);
const axisWidth = run(
  `()=>${expression(variable(source, "Y_AXIS_WIDTH").initializer)}`,
  {}
);
const datasets = [
  [],
  [
    { a: 2, b: 30 },
    { a: 5, b: 14 },
  ],
  [
    { a: -30, b: -5 },
    { a: -10, b: -8 },
  ],
  [{ a: 7, b: 7 }],
  [{ a: 0, b: 0 }],
  [{ a: null, b: "missing" }],
  [
    { a: -12, b: 5 },
    { a: 18, b: null },
  ],
];
const extents = [];
for (const data of datasets) {
  for (const seriesKeys of [[], ["a"], ["a", "b"]]) {
    for (const yDomain of [
      null,
      ["auto", "auto"],
      [0, "auto"],
      ["auto", 50],
      [-10, 20],
    ]) {
      for (const hasBars of [false, true]) {
        for (const nice of [false, true]) {
          extents.push({
            data,
            hasBars,
            nice,
            output: run(extentExpression, {
              data,
              hasBars,
              nice,
              seriesKeys,
              yDomain: yDomain ?? undefined,
              ...finite,
              niceDomain: chart.niceDomain,
            }),
            seriesKeys,
            yDomain,
          });
        }
      }
    }
  }
}
const sizes = [];
for (const [width, height] of [
  [0, 0],
  [320, 160],
  [100, 200],
  [40, 20],
]) {
  for (const compact of [false, true]) {
    for (const hasYAxis of [false, true]) {
      sizes.push({
        compact,
        hasYAxis,
        height,
        output: run(
          `()=>{const pad=${padExpression};return ${plotExpression};}`,
          {
            PADDING: padding,
            Y_AXIS_WIDTH: axisWidth,
            compact,
            hasYAxis,
            size: { height, width },
          }
        ),
        width,
      });
    }
  }
}
const plot = { height: 126, left: 44, top: 12, width: 266 };
const xTicks = [];
const xExpression = memo(fn("PlotXAxis"), "labels");
for (const total of [0, 1, 2, 5, 12]) {
  for (const ticks of [0, 1, 2, 4, 5, 20]) {
    const data = Array.from({ length: total }, (_, index) => ({
      a: index,
      label: `Row ${index}`,
    }));
    xTicks.push({
      data,
      output: run(xExpression, {
        data,
        format: undefined,
        ticks,
        xDataKey: "label",
      }),
      ticks,
    });
  }
}
const yTicks = [];
const yExpression = memo(fn("PlotYAxis"), "labels");
for (const extent of [
  [0, 0],
  [0, 1],
  [-10, 20],
  [8.5, 37.5],
  [1000, 100_000],
]) {
  for (const ticks of [1, 2, 4, 6]) {
    yTicks.push({
      extent,
      output: run(yExpression, {
        compactNumber: chart.compactNumber,
        extent,
        format: undefined,
        ticks,
      }),
      ticks,
    });
  }
}
const cursors = [];
const resolveExpression = expression(
  variable(fn("PlotCursor"), "resolve").initializer
);
for (const total of [0, 1, 2, 5]) {
  for (const banded of [false, true]) {
    for (const x of [-50, 44, 70, 110, 177, 309, 310, 500]) {
      const activeIndex = { value: -1 };
      run(`()=>{const resolve=${resolveExpression};resolve(x);}`, {
        activeIndex,
        banded,
        left: plot.left,
        runOnJS: (work) => work,
        setActiveIndexJS: () => {},
        total,
        width: plot.width,
        x,
      });
      cursors.push({ banded, output: activeIndex.value, plot, total, x });
    }
  }
}
const bars = [];
const barsFunction = fn("PlotBars");
const barsExpression = expression(
  variable(barsFunction, "animatedProps").initializer.arguments[0]
);
const barsSetup = ["total", "slice", "width"]
  .map(
    (name) =>
      `const ${name}=${expression(variable(barsFunction, name).initializer)};`
  )
  .join("\n");
for (const values of [[], [0, 2, 5], [-5, 3, null], [10], [null, null]]) {
  for (const baseline of [-20, 0, 2, 20]) {
    for (const gap of [0, 0.35, 1]) {
      const result = run(`()=>{${barsSetup}return (${barsExpression})();}`, {
        bandOf: chart.bandOf,
        barPath: chart.barPath,
        baseline,
        domainMax: { value: 15 },
        domainMin: { value: -10 },
        gap,
        plot,
        radius: 4,
        values,
        yOf: chart.yOf,
      });
      bars.push({
        baseline,
        gap,
        max: 15,
        min: -10,
        output: result.d,
        plot,
        radius: 4,
        values,
      });
    }
  }
}
const paths = [];
for (const values of [
  [],
  [4],
  [2, 5, 3],
  [2, null, 5],
  [null, null],
  [-5, 0, 5],
]) {
  for (const curve of ["linear", "monotone"]) {
    for (const banded of [false, true]) {
      for (const loading of [false, true]) {
        for (const kind of ["linePath", "areaPath"]) {
          const args = [values, plot, -10, 15, curve, loading, null, banded];
          paths.push({
            args,
            kind,
            output: chart[kind](...args.slice(0, 6), undefined, banded),
          });
        }
      }
    }
  }
}
for (const curve of ["linear", "monotone"]) {
  for (const points of [
    [],
    [{ x: 1, y: 2 }],
    [
      { x: 0, y: 1 },
      { x: 2, y: 3 },
      { x: 5, y: 2 },
    ],
  ]) {
    paths.push({
      args: [points, curve],
      kind: "segment",
      output: chart.segment(points, curve),
    });
  }
}
for (const direction of ["up", "down", "left", "right"]) {
  for (const radius of [0, 4, 80]) {
    paths.push({
      args: [10, 20, 14, 40, radius, direction],
      kind: "barPath",
      output: chart.barPath(10, 20, 14, 40, radius, direction),
    });
  }
}
const scales = [];
for (const kind of ["xOf", "bandOf"]) {
  for (const total of [0, 1, 2, 5]) {
    for (const index of [-1, 0, 1, 4]) {
      const args = [index, total, plot];
      scales.push({ args, kind, output: chart[kind](...args) });
    }
  }
}
for (const kind of ["xAt", "yOf"]) {
  for (const value of [-20, 0, 15, 40]) {
    const args = [value, plot, -10, 15];
    scales.push({ args, kind, output: chart[kind](...args) });
  }
}
for (const [min, max] of [
  [0, 1],
  [-23, 71],
  [7, 7],
  [1.25, 9.7],
  [31_500, 34_650],
]) {
  for (const ticks of [1, 4, 5, 8]) {
    scales.push({
      args: [min, max, ticks],
      kind: "niceDomain",
      output: chart.niceDomain(min, max, ticks),
    });
  }
}
for (const value of [
  0, 0.12, 1.25, 999, 1000, 999_950, -12_345, 1_000_000_000,
]) {
  scales.push({
    args: [value],
    kind: "compactNumber",
    output: chart.compactNumber(value),
  });
}
const location = (node) => {
  const file = node.getSourceFile();
  return {
    endLine: file.getLineAndCharacterOfPosition(node.end).line + 1,
    file: file.fileName,
    startLine: file.getLineAndCharacterOfPosition(node.getStart()).line + 1,
  };
};
const captures = {
  bars: location(variable(fn("PlotBars"), "animatedProps")),
  cursors: location(variable(fn("PlotCursor"), "resolve")),
  extents: location(variable(rootNode, "extent")),
  paths: {
    file: "packages/panelui/src/utils/chart.ts",
    functions: ["linePath", "areaPath", "segment", "barPath"],
  },
  registrations: {
    file: "packages/panelui/src/components/plot/plot-series-registry.ts",
    functions: [
      "registerPlotSeries",
      "unregisterPlotSeries",
      "visiblePlotSeries",
    ],
  },
  scales: {
    file: "packages/panelui/src/utils/chart.ts",
    functions: ["xOf", "bandOf", "xAt", "yOf", "niceDomain", "compactNumber"],
  },
  sizes: {
    pad: location(variable(rootNode, "pad")),
    plot: location(variable(rootNode, "plot")),
  },
  xTicks: location(variable(fn("PlotXAxis"), "labels")),
  yTicks: location(variable(fn("PlotYAxis"), "labels")),
};
const registrations = [];
let current = [];
for (const operation of [
  { color: "red", key: "a", kind: "register" },
  { color: "blue", key: "a", kind: "register" },
  { color: "green", key: "b", kind: "register" },
  { color: "red", key: "a", kind: "register" },
  { color: "red", key: "a", kind: "unregister" },
  { key: "missing", kind: "unregister" },
  { color: "missing", key: "a", kind: "unregister" },
  { key: "a", kind: "unregister" },
  { color: "red", key: "a", kind: "unregister" },
  { color: "green", key: "b", kind: "unregister" },
]) {
  const previous = current;
  current =
    operation.kind === "register"
      ? registry.registerPlotSeries(current, operation.key, operation.color)
      : registry.unregisterPlotSeries(current, operation.key, operation.color);
  registrations.push({
    operation,
    output: current,
    sameReference: previous === current,
    visible: registry.visiblePlotSeries(current),
  });
}
fs.writeFileSync(
  new URL("../test/fixtures/plot-source.json", import.meta.url),
  `${JSON.stringify({ bars, captures, commit, cursors, extents, paths, registrations, scales, sizes, sources, xTicks, yTicks }, null, 2)}\n`
);
