import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  throw new Error("Provide the pinned PanelUI checkout");
}
const commit = execFileSync("git", ["-C", sourceRoot, "rev-parse", "HEAD"], {
  encoding: "utf-8",
}).trim();
if (commit !== "b0aec40f8674dbe7f467be377bc3544359711ab0") {
  throw new Error("Soundwave source differs from the pinned commit");
}
const filename = path.join(
  sourceRoot,
  "packages/panelui/src/components/soundwave/index.tsx"
);
const source = ts.createSourceFile(
  filename,
  fs.readFileSync(filename, "utf-8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const functions = new Set([
  "clamp01",
  "hashD",
  "q",
  "idleEnergy",
  "barValue",
  "Pill",
  "BarsWave",
  "LineWave",
]);
const constants = new Set(["FLOOR", "LINE_POINTS", "UNPLAYED_OPACITY"]);
const selected = source.statements.filter(
  (node) =>
    (ts.isFunctionDeclaration(node) && functions.has(node.name.text)) ||
    (ts.isVariableStatement(node) &&
      node.declarationList.declarations.some((item) =>
        constants.has(item.name.getText(source))
      ))
);
const text = `${ts.createPrinter().printFile(ts.factory.updateSourceFile(source, selected))}\nexport { Pill, BarsWave, LineWave, idleEnergy };`;
const compiled = ts.transpileModule(text, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const original = {};
const jsx = (type, props) => ({ props, type });
vm.runInContext(
  compiled,
  vm.createContext({
    Animated: { View: "View" },
    AnimatedPath: "Path",
    Svg: "Svg",
    exports: original,
    require: (name) => {
      if (name !== "react/jsx-runtime") {
        throw new Error(`Unexpected source import ${name}`);
      }
      return { jsx, jsxs: jsx };
    },
    useAnimatedProps: (draw) => draw(),
    useAnimatedStyle: (draw) => draw(),
  }),
  { timeout: 1000 }
);
const frame = (clock, energy, samples = []) => ({
  clock: { value: clock },
  energy: { value: energy },
  samples: { value: samples },
});
const pills = [];
for (const count of [1, 4, 7]) {
  for (const width of [12, 28]) {
    for (const clock of [0, 0.016, 2.4]) {
      for (const energy of [0, 0.42, 1]) {
        const heights = Array.from(
          { length: count },
          (_, index) =>
            original.Pill({
              color: "#262626",
              count,
              engine: frame(clock, energy),
              index,
              maxHeight: 96,
              minHeight: width * 1.35,
              width,
            }).props.style[1].height
        );
        pills.push({ clock, count, energy, height: 96, heights, width });
      }
    }
  }
}
const bars = [];
for (const count of [1, 4, 40]) {
  for (const centered of [false, true]) {
    for (const mode of ["motion", "bands", "history"]) {
      for (const progress of [null, 0, 0.49, 1]) {
        const bands = mode === "bands" ? [0.1, 0.8, 0.4, 0.9, 0.2] : [];
        const samples = mode === "history" ? [0.1, 0.5, 0.9].slice(-count) : [];
        const node = original.BarsWave({
          bands: { value: bands },
          barWidth: 3,
          centered,
          count,
          defs: null,
          engine: frame(2.4, 0.42, samples),
          hasProgress: progress !== null,
          height: 56,
          progress: { value: progress ?? 0 },
          scrolling: mode === "history",
          stroke: "#262626",
          trackStroke: null,
          width: 240,
        });
        bars.push({
          bands,
          barWidth: 3,
          centered,
          clock: 2.4,
          count,
          energy: 0.42,
          height: 56,
          paths: node.props.children
            .slice(1)
            .map((child) => child.props.animatedProps.d),
          progress,
          samples,
          scrolling: mode === "history",
          width: 240,
        });
      }
    }
  }
}
const lines = [];
for (const width of [40, 240]) {
  for (const clock of [0, 0.016, 2.4]) {
    for (const energy of [0, 0.42, 1]) {
      const node = original.LineWave({
        defs: null,
        engine: frame(clock, energy),
        height: 72,
        stroke: "#262626",
        strokeWidth: 3,
        width,
      });
      lines.push({
        clock,
        energy,
        height: 72,
        path: node.props.children[1].props.animatedProps.d,
        strokeWidth: 3,
        width,
      });
    }
  }
}
const states = ["idle", "listening", "thinking", "speaking"];
const energies = states.flatMap((state) =>
  [0, 0.016, 2.4, 6.8].map((clock) => ({
    clock,
    energy: original.idleEnergy(state, clock),
    state,
  }))
);
fs.writeFileSync(
  new URL("../test/fixtures/soundwave-source.json", import.meta.url),
  `${JSON.stringify({ bars, commit, energies, lines, pills }, null, 2)}\n`
);
console.log({
  bars: bars.length,
  energies: energies.length,
  lines: lines.length,
  pills: pills.length,
});
