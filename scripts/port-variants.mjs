import fs from "node:fs";

import ts from "typescript";

const [sourcePath, outputPath, declaration, opacityOutputPath] =
  process.argv.slice(2);
const spacing =
  /^(?<sign>-?)(?<property>size|leading|translate-[xy]|(?:min-|max-)?[wh]|[mp][xysetblr]?|gap(?:-[xy])?|inset(?:-[xy])?|top|bottom|left|right)-(?<value>\d+(?:\.\d+)?)$/u;
const colors =
  /^(?<property>bg|text|border(?:-[tblresxy])?)-(?<token>[a-z][a-z0-9-]*)(?:\/(?<opacity>\d+(?:_\d+)?))?$/u;
const radius = {
  "2xl": "2xl",
  "3xl": "3xl",
  lg: "lg",
  md: "md",
  sm: "sm",
  xl: "xl",
  xs: "xs",
};
const fonts = {
  "2xl": [48, "1.333333"],
  "3xl": [60, "1.2"],
  "4xl": [72, "1.111111"],
  "5xl": [96, "1"],
  "6xl": [120, "1"],
  base: [32, "1.5"],
  lg: [36, "1.555556"],
  sm: [28, "1.428571"],
  xl: [40, "1.4"],
  xs: [24, "1.333333"],
};
const tokenPath = new URL("../src/theme/tokens.ts", import.meta.url);
const tokenSource = ts.createSourceFile(
  "tokens.ts",
  fs.readFileSync(tokenPath, "utf-8"),
  ts.ScriptTarget.Latest,
  true
);
const themes = {};
const readTokens = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    node.name.getText(tokenSource) === "THEME_TOKENS"
  ) {
    let value = node.initializer;
    while (ts.isAsExpression(value)) {
      value = value.expression;
    }
    for (const theme of value.properties) {
      const entries = {};
      for (const property of theme.initializer.properties) {
        entries[property.name.text] = property.initializer.text;
      }
      themes[theme.name.text] = entries;
    }
  }
  ts.forEachChild(node, readTokens);
};
readTokens(tokenSource);
const tokens = new Set(Object.keys(themes.light));
const opacities = new Set();
const convertShape = (utility) => {
  if (utility === "border") {
    return "border-[2px] border-solid";
  }
  const borderSide = utility.match(/^border-(?<side>[tblresxy])$/u);
  if (borderSide) {
    return `border-${borderSide.groups.side}-[2px] border-solid`;
  }
  const borderWidth = utility.match(
    /^(?<property>border(?:-[tblresxy])?)-(?<width>\d+)$/u
  );
  if (borderWidth) {
    return `${borderWidth.groups.property}-[${Number(borderWidth.groups.width) * 2}px] border-solid`;
  }
  const container = utility.match(
    /^(?<property>(?:min-|max-)?[wh])-(?<size>xs|sm|md|lg|xl|[2-7]xl)$/u
  );
  if (container) {
    const widths = {
      "2xl": 672,
      "3xl": 768,
      "4xl": 896,
      "5xl": 1024,
      "6xl": 1152,
      "7xl": 1280,
      lg: 512,
      md: 448,
      sm: 384,
      xl: 576,
      xs: 320,
    };
    return `${container.groups.property}-[${widths[container.groups.size] * 2}px]`;
  }
  if (utility.startsWith("rounded-") && radius[utility.slice(8)]) {
    return `rounded-[var(--panel-radius-${radius[utility.slice(8)]})]`;
  }
  const directionalRadius = utility.match(
    /^rounded-(?<side>[tblrse]|tl|tr|bl|br|ss|se|es|ee)-(?<size>xs|sm|md|lg|xl|[23]xl)$/u
  );
  if (directionalRadius) {
    return `rounded-${directionalRadius.groups.side}-[var(--panel-radius-${directionalRadius.groups.size})]`;
  }
};
const modifierOf = (utility) => {
  let depth = 0;
  for (let index = 0; index < utility.length; index += 1) {
    if (utility[index] === "[") {
      depth += 1;
    } else if (utility[index] === "]") {
      depth -= 1;
    } else if (utility[index] === ":" && depth === 0) {
      return {
        prefix: utility.slice(0, index + 1),
        utility: utility.slice(index + 1),
      };
    }
  }
};
const convert = (input) => {
  const utilities = input.split(/\s+/u);
  const explicitBorderStyle = utilities.some((utility) =>
    /^border-(?:solid|dashed|dotted|double|none)$/u.test(utility)
  );
  const explicitLineHeight = utilities.some((utility) =>
    utility.startsWith("leading-")
  );
  return utilities
    .map((utility) => {
      const modifier = modifierOf(utility);
      if (modifier) {
        return convert(modifier.utility)
          .split(/\s+/u)
          .map((part) => `${modifier.prefix}${part}`)
          .join(" ");
      }
      const match = utility.match(spacing);
      if (match) {
        return `${match.groups.sign}${match.groups.property}-[${Number(match.groups.value) * 8}px]`;
      }
      if (utility === "flex-row" || utility === "flex-col") {
        return `flex ${utility}`;
      }
      if (utility.startsWith("text-") && fonts[utility.slice(5)]) {
        const [size, height] = fonts[utility.slice(5)];
        return explicitLineHeight
          ? `text-[${size}px]`
          : `text-[${size}px] leading-[${height}]`;
      }
      if (/^[a-z-]+-\[\d+(?:\.\d+)?px\]$/u.test(utility)) {
        return utility.replace(
          /(?<value>\d+(?:\.\d+)?)px/u,
          (_, value) => `${Number(value) * 2}px`
        );
      }
      if (/^(?:[hw]|[mp][xysetblr]?)-px$/u.test(utility)) {
        return `${utility.slice(0, -3)}-[2px]`;
      }
      const shape = convertShape(utility);
      if (shape) {
        return explicitBorderStyle
          ? shape.replaceAll(" border-solid", "")
          : shape;
      }
      if (
        [
          "border-dashed",
          "border-solid",
          "border-dotted",
          "border-double",
          "border-none",
        ].includes(utility)
      ) {
        return utility;
      }
      const normalizedColor = utility.replace(
        /\/\[(?<alpha>(?:0(?:\.\d+)?|\.\d+)|1(?:\.0+)?)\]$/u,
        (_match, alpha) =>
          `/${String(Math.round(Number(alpha) * 100_000) / 1000).replace(".", "_")}`
      );
      const color = normalizedColor.match(colors);
      if (color && tokens.has(color.groups.token)) {
        const { property, token, opacity } = color.groups;
        if (opacity) {
          opacities.add(`${token}:${opacity}`);
        }
        return `${property}-[${property === "text" ? "color:" : ""}var(--panel-${token}${opacity ? `-opacity-${opacity}` : ""})]`;
      }
      if (
        color &&
        ![
          "transparent",
          "white",
          "black",
          "center",
          "left",
          "right",
          "start",
          "end",
          "justify",
          "wrap",
          "nowrap",
        ].includes(color.groups.token)
      ) {
        throw new Error(`Unsupported utility: ${utility}`);
      }
      return utility;
    })
    .join(" ");
};
const source = ts.createSourceFile(
  sourcePath,
  fs.readFileSync(sourcePath, "utf-8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
for (const match of source.text.matchAll(
  /\b(?:bg|text|border(?:-[tblresxy])?)-(?<token>[a-z][a-z0-9-]*)\/(?<opacity>\d+)/gu
)) {
  if (tokens.has(match.groups.token)) {
    opacities.add(`${match.groups.token}:${match.groups.opacity}`);
  }
}
let argument;
const find = (node) => {
  if (
    ts.isVariableDeclaration(node) &&
    node.name.getText(source) === declaration &&
    node.initializer &&
    ts.isCallExpression(node.initializer)
  ) {
    [argument] = node.initializer.arguments;
  }
  ts.forEachChild(node, find);
};
find(source);
if (!argument) {
  throw new Error(`Missing variants: ${declaration}`);
}
const transformed = ts.transform(argument, [
  (context) => {
    const visit = (node) =>
      ts.isStringLiteral(node)
        ? ts.factory.createStringLiteral(convert(node.text))
        : ts.visitEachChild(node, visit, context);
    return (node) => ts.visitNode(node, visit);
  },
]);
const code = ts
  .createPrinter({ removeComments: true })
  .printNode(ts.EmitHint.Expression, transformed.transformed[0], source);
fs.writeFileSync(
  outputPath,
  `import { tv } from "../../lib/variants";\n\nexport const ${declaration} = tv(${code});\n`
);
transformed.dispose();

const opacityPath =
  opacityOutputPath ??
  new URL("../src/styles/variant-opacity.scss", import.meta.url);
const previous = fs.existsSync(opacityPath)
  ? fs.readFileSync(opacityPath, "utf-8")
  : "";
for (const match of previous.matchAll(
  /--panel-(?<token>[a-z-]+)-opacity-(?<opacity>\d+(?:_\d+)?):/gu
)) {
  opacities.add(`${match.groups.token}:${match.groups.opacity}`);
}
const rgba = (value, opacity) => {
  const alpha = Number(opacity.replaceAll("_", ".")) / 100;
  if (/^#[\da-f]{6}$/iu.test(value)) {
    const channels = [1, 3, 5].map((start) =>
      Number.parseInt(value.slice(start, start + 2), 16)
    );
    return `rgba(${channels.join(", ")}, ${alpha})`;
  }
  const match = value.match(
    /^rgba?\((?<r>\d+),\s*(?<g>\d+),\s*(?<b>\d+)(?:,\s*(?<a>[\d.]+))?\)$/u
  );
  if (!match) {
    throw new Error(`Unsupported opacity token: ${value}`);
  }
  const { r, g, b, a } = match.groups;
  return `rgba(${r}, ${g}, ${b}, ${alpha * Number(a ?? 1)})`;
};
const opacityCss = Object.entries(themes)
  .map(
    ([theme, values]) =>
      `.panelui-theme--${theme} {\n${[...opacities]
        .toSorted()
        .map((entry) => {
          const [token, opacity] = entry.split(":");
          return `  --panel-${token}-opacity-${opacity}: ${rgba(values[token], opacity)};`;
        })
        .join("\n")}\n}`
  )
  .join("\n");
fs.writeFileSync(opacityPath, `${opacityCss}\n`);
