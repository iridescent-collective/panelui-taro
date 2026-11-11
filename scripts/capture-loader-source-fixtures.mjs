import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  throw new Error("Provide the pinned PanelUI checkout path");
}
const commit = execFileSync("git", ["-C", sourceRoot, "rev-parse", "HEAD"], {
  encoding: "utf-8",
}).trim();
if (commit !== "b0aec40f8674dbe7f467be377bc3544359711ab0") {
  throw new Error("Unexpected PanelUI source commit");
}
const source = fs.readFileSync(
  path.join(sourceRoot, "packages/panelui/src/components/loader/index.tsx"),
  "utf-8"
);
const react = {
  createElement: (type, props, ...children) =>
    typeof type === "function"
      ? type({ ...props, children })
      : { props: { ...props, children }, type },
  memo: (fn) => fn,
  useEffect: (fn) => fn(),
};
const animated = {
  cancelAnimation: () => false,
  default: { View: "View", createAnimatedComponent: (type) => type },
  useAnimatedProps: (fn) => fn(),
  useAnimatedStyle: (fn) => fn(),
  useFrameCallback: () => ({ setActive: () => false }),
  useReducedMotion: () => true,
  useSharedValue: (value) => ({ value }),
};
const code = ts.transpileModule(source, {
  compilerOptions: {
    esModuleInterop: true,
    jsx: ts.JsxEmit.React,
    module: ts.ModuleKind.CommonJS,
  },
}).outputText;
const sourceExports = {};
const context = {
  React: react,
  exports: sourceExports,
  require: (name) => {
    if (name === "react") {
      return react;
    }
    if (name === "react-native") {
      return { View: "View" };
    }
    if (name === "react-native-svg") {
      return {
        Ellipse: "Ellipse",
        Path: "Path",
        __esModule: true,
        default: "Svg",
      };
    }
    if (name === "react-native-reanimated") {
      return { __esModule: true, ...animated };
    }
    if (name === "uniwind") {
      return { useCSSVariable: () => "#262626" };
    }
    if (name === "tailwind-variants") {
      return { tv: () => () => "root" };
    }
    if (name === "../../icons") {
      return { useIconColor: () => null };
    }
    if (name === "../../utils/cn") {
      return { cn: (...args) => args.filter(Boolean).join(" ") };
    }
    throw new Error(name);
  },
};
vm.runInNewContext(code, context);
const variants = [
  "pulse-dots",
  "bounce-dots",
  "pulsating-dots",
  "liquid-dots",
  "bar-cascade",
  "bouncing-bars",
  "symmetric-wave",
  "morph-ring",
  "wave-physics",
];
fs.writeFileSync(
  new URL("../test/fixtures/loader-source-static.json", import.meta.url),
  `${JSON.stringify(Object.fromEntries(variants.map((variant) => [variant, sourceExports.Loader({ variant })])), null, 2)}\n`
);
