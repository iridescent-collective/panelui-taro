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
  throw new Error("Carousel source differs from the pinned commit");
}
const filename = path.join(
  sourceRoot,
  "packages/panelui/src/components/carousel/index.tsx"
);
const source = ts.createSourceFile(
  filename,
  fs.readFileSync(filename, "utf-8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const functions = new Set(["distance", "CarouselItem", "CarouselCaption"]);
const constants = new Set([
  "COVERFLOW_DEPTH",
  "COVERFLOW_SPREAD",
  "STACK_DEPTH",
]);
const selected = source.statements.filter(
  (node) =>
    (ts.isFunctionDeclaration(node) && functions.has(node.name?.text)) ||
    (ts.isVariableStatement(node) &&
      node.declarationList.declarations.some((item) =>
        constants.has(item.name.getText(source))
      ))
);
const text = `${ts.createPrinter().printFile(ts.factory.updateSourceFile(source, selected))}\nexport {CarouselItem, CarouselCaption};`;
const compiled = ts.transpileModule(text, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
let context;
let itemIndex;
const exports = {};
const jsx = (type, props) => ({ props, type });
const interpolate = (value, input, output) => {
  let segment = 0;
  while (segment < input.length - 2 && value > input[segment + 1]) {
    segment += 1;
  }
  const progress = Math.max(
    0,
    Math.min(
      1,
      (value - input[segment]) / (input[segment + 1] - input[segment])
    )
  );
  return output[segment] + progress * (output[segment + 1] - output[segment]);
};
vm.runInContext(
  compiled,
  vm.createContext({
    Animated: { View: "View" },
    Extrapolation: { CLAMP: "clamp" },
    ItemIndexContext: {},
    Text: "Text",
    cn: () => "",
    exports,
    interpolate,
    require: (name) => {
      if (name !== "react/jsx-runtime") {
        throw new Error(`Unexpected source import ${name}`);
      }
      return { jsx, jsxs: jsx };
    },
    textChildren: (children) => children,
    useAnimatedStyle: (draw) => draw(),
    useCarousel: () => context,
    useContext: () => itemIndex,
  }),
  { timeout: 1000 }
);
const cases = [];
for (const variant of ["default", "interactive", "coverflow", "stack"]) {
  for (const orientation of ["horizontal", "vertical"]) {
    for (const d of [-3, -1, -0.15, 0, 0.3, 1, 2.5]) {
      for (const engaged of [0, 1]) {
        itemIndex = 3;
        context = {
          count: 7,
          engaged: { value: engaged },
          index: 3,
          itemSize: 200,
          loop: false,
          orientation,
          progress: { value: 3 - d },
          variant,
        };
        cases.push({
          caption: exports.CarouselCaption({}).props.style[0].opacity,
          d,
          engaged,
          itemSize: 200,
          motion: exports.CarouselItem({}).props.style[3],
          orientation,
          variant,
        });
      }
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/carousel-source.json", import.meta.url),
  `${JSON.stringify({ cases, commit }, null, 2)}\n`
);
process.stdout.write(`${cases.length} source frames captured\n`);
