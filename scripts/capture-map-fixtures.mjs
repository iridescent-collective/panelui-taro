import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
const pinned = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const read = (relative) => {
  const source = fs.readFileSync(path.join(sourceRoot, relative), "utf-8");
  if (
    source !==
    execFileSync("git", ["-C", sourceRoot, "show", `${pinned}:${relative}`], {
      encoding: "utf-8",
    })
  ) {
    throw new Error("Source differs from pinned commit");
  }
  return source;
};
const sandbox = {
  MapLibre: { GeoJSONSource: "source", Layer: "layer" },
  React: {
    createElement: (type, props, ...children) => ({
      props: { ...props, children },
      type,
    }),
  },
  exports: {},
  useToken: (_, fallback) => fallback,
};
vm.createContext(sandbox);
const evaluate = (source) =>
  vm.runInContext(
    ts.transpileModule(source, {
      compilerOptions: {
        jsx: ts.JsxEmit.React,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    sandbox,
    { timeout: 1000 }
  );
const base = "packages/panelui/src/components/map/";
evaluate(read(`${base}map-insets.ts`));
const insets = sandbox.exports;
evaluate(read(`${base}basemap.ts`));
const basemap = sandbox.exports;
const source = read(`${base}index.tsx`);
const tree = ts.createSourceFile(
  "map.tsx",
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const functions = tree.statements
  .filter(
    (node) =>
      ts.isFunctionDeclaration(node) &&
      ["withAlpha", "isToken", "MapHeatmap", "MapCluster"].includes(
        node.name?.text
      )
  )
  .map((node) => node.getText(tree))
  .join("\n");
evaluate(functions);
const corners = ["top-left", "top-right", "bottom-left", "bottom-right"];
const offsets = [];
for (const position of ["top", "bottom", ...corners]) {
  for (const inset of [
    undefined,
    0,
    12,
    30,
    { left: 4, top: 18 },
    { bottom: 32, right: 20, top: -3 },
  ]) {
    for (const safe of [
      { bottom: 0, left: 0, right: 0, top: 0 },
      { bottom: 34, left: 0, right: 0, top: 44 },
    ]) {
      const normalized = insets.resolveMapInsets(inset, 12, safe);
      for (const height of [0, 32, 88]) {
        offsets.push({
          height,
          inset: inset ?? null,
          normalized,
          offsets: insets.overlayOffsets(position, normalized),
          position,
          reservation: insets.overlayReservation(position, normalized, height),
          safe,
        });
      }
    }
  }
}
const controls = [];
for (const corner of corners) {
  for (const reserved of [0, 10, 44, 100]) {
    const inset = { bottom: 46, left: 12, right: 12, top: 56 };
    controls.push({
      corner,
      inset,
      output: insets.controlsOffsets(corner, { gap: 12, inset, reserved }),
      reserved,
    });
  }
}
const colors = [];
for (const color of [
  "#123",
  "#123456",
  "#123456ff",
  "rgba(12, 34, 56, .8)",
  "rgb(12,34,56)",
  "hsl(200, 80%, 50%)",
]) {
  for (const alpha of [0.25, 0.45, 0.7, 0.9, 1]) {
    colors.push({ alpha, color, output: sandbox.withAlpha(color, alpha) });
  }
}
const heatmaps = [];
for (const props of [
  {},
  {
    intensity: 2,
    maxZoom: 18,
    opacity: 0.6,
    points: true,
    radius: 40,
    weight: "value",
  },
  { color: "#12ab34", colors: ["#ffffff", "#ff0000"], points: true },
]) {
  const node = sandbox.MapHeatmap(props);
  heatmaps.push({
    layers: node.props.children.filter(Boolean).map((layer) => layer.props),
    props,
  });
}
const tokens = {
  background: "#ffffff",
  building: "#ddddee",
  label: "#666666",
  labelHalo: "#ffffff",
  land: "#eeeeff",
  line: "#bbbbbb",
  water: "#eeeeee",
};
const basemaps = [false, true].map((blank) => ({
  blank,
  output: basemap.buildBasemapStyle(tokens, { blank }),
  tokens,
}));
const arc = tree.statements.find(
  (node) => ts.isFunctionDeclaration(node) && node.name?.text === "MapArc"
);
let arrow;
const visit = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    node.name.getText(tree) === "data" &&
    ts.isCallExpression(node.initializer)
  ) {
    [arrow] = node.initializer.arguments;
  }
  ts.forEachChild(node, visit);
};
visit(arc);
evaluate(
  `function capturedArc(from,to,curvature){${arrow.body.getText(tree).slice(1, -1)}}`
);
const arcs = [];
for (const from of [
  [0, 0],
  [121.4, 31.2],
  [-73.9, 40.7],
]) {
  for (const to of [
    [1, 1],
    [116.4, 39.9],
    [180, -80],
  ]) {
    for (const curvature of [0, 0.2, -0.5, 1]) {
      arcs.push({
        curvature,
        from,
        output: sandbox.capturedArc(from, to, curvature).geometry.coordinates,
        to,
      });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/map-source.json", import.meta.url),
  `${JSON.stringify({ arcs, basemaps, colors, commit: pinned, controls, heatmaps, offsets }, null, 2)}\n`
);
