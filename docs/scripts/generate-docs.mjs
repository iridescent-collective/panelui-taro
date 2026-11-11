import {
  readFileSync as readFile,
  writeFileSync as writeFile,
  mkdirSync as mkdir,
  readdirSync as readdir,
  rmSync as remove,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const site = fileURLToPath(new URL("../", import.meta.url));
const library = path.resolve(site, "..");
const readJson = (file) => JSON.parse(readFile(file, "utf-8"));
const manifest = readJson(path.join(library, "source-manifest.json"));
const pkg = readJson(path.join(library, "package.json"));
const entries = readJson(
  path.join(library, "example/src/data/components.json")
);
const docs = path.join(site, "content/docs");
const fence = (language, text) =>
  `\n\`\`\`${language}\n${text.trim()}\n\`\`\`\n`;
const frontmatter = (title, description) =>
  `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n---\n\n`;
const filesIn = (directory) => {
  const files = [];
  for (const entry of readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...filesIn(full));
    } else if (/\.tsx?$/u.test(entry.name)) {
      files.push(full);
    }
  }
  return files.toSorted();
};
const publicTypes = (directory) => {
  const definitions = [];
  for (const file of filesIn(directory)) {
    const content = readFile(file, "utf-8");
    const ast = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true
    );
    for (const node of ast.statements) {
      if (
        !(ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node))
      ) {
        continue;
      }
      if (
        !node.modifiers?.some(
          (item) => item.kind === ts.SyntaxKind.ExportKeyword
        )
      ) {
        continue;
      }
      definitions.push(node.getText(ast));
    }
  }
  return [...new Set(definitions)].join("\n\n");
};
remove(path.join(docs, "components"), { force: true, recursive: true });
mkdir(path.join(docs, "components"), { recursive: true });
const catalogue = [];
for (const entry of entries) {
  const record = [...manifest.records, ...(manifest.supplementalRecords ?? [])].find((item) => item.module === entry.slug);
  if (!record || !pkg.exports[`./${entry.slug}`]) {
    throw new Error(`Missing public component: ${entry.slug}`);
  }
  const exported = pkg.exports[`./${entry.slug}`];
  const sourcePath = typeof exported === "string" ? exported : exported.source ?? exported.default;
  const symbols = record.targetApi.exports.filter(
    (name) =>
      !/(?:Props|Ref|Handle|Options|Variant|Size|Value|Context|State|Direction|Mode|Type|Data)$/u.test(
        name
      )
  );
  const component =
    symbols.find((name) => name === entry.name) ??
    symbols.find((name) => /^[A-Z]/u.test(name)) ??
    entry.name;
  const types = publicTypes(path.dirname(path.join(library, sourcePath)));
  const exports = record.targetApi.exports
    .map((name) => `- \`${name}\``)
    .join("\n");
  const { parts } = record.targetApi;
  const anatomy = parts.length
    ? parts.map((part) => `- \`${component}.${part}\``).join("\n")
    : "This module has no compound parts recorded in the source inventory.";
  const variants = entry.variants.map((item) => `- ${item.label}`).join("\n");
  const body =
    `${frontmatter(component, entry.summary)}## Import\n${fence(
      "tsx",
      `import { ${component} } from "panelui-taro/${entry.slug}";`
    )}\nWrap your page in [PanelUIProvider](/docs/installation#provider-and-styles). Use the [WeChat example](/docs/example) to run this component.\n\n` +
    `## Anatomy\n\n${anatomy}\n\n## Public exports\n\n${exports}${
      types
        ? "\n\n## Type reference\n\nThese declarations come from the current Taro implementation. Local helper types and inherited Taro host props are resolved by your editor.\n" +
          fence("ts", types)
        : ""
    }\n## Examples\n\nOpen this route in the standalone WeChat example:\n${fence(
      "text",
      entry.route
    )}\nAvailable example variants:\n\n${
      variants
    }\n\n## Platform and coverage\n\nThis is a Native-derived Taro implementation. RN worklets and Expo platform controls do not run in WeChat. See [platform differences](/docs/platform) before using native media, maps, gestures or Canvas exports.\n\n` +
    `The source inventory records implementation as **${record.implementation}** and acceptance as **${record.acceptance}**. Export and anatomy coverage is not complete behavior or physical-device acceptance. Package alignment: **${pkg.version}**.\n`;
  writeFile(path.join(docs, "components", `${entry.slug}.mdx`), body);
  const chinese = `${frontmatter(component, `${component} 的 Taro API、组合结构与微信示例。`)}## 导入
${fence("tsx", `import { ${component} } from "panelui-taro/${entry.slug}";`)}
在页面外层使用 [PanelUIProvider](/docs/installation)。通过[微信示例](/docs/example)运行真实组件。

## 组合结构

${parts.length ? parts.map((part) => `- \`${component}.${part}\``).join("\n") : "此模块没有记录组合式子组件。"}

## 公开导出

${exports}
${types ? `\n## 类型参考\n\n以下声明来自当前 Taro 实现。辅助类型与继承的 Taro 宿主属性由编辑器解析。\n${fence("ts", types)}` : ""}
## 示例

在独立微信示例中打开此路由：
${fence("text", entry.route)}
可用的官方示例变体（保留原始名称，便于与源码核对）：

${variants}

## 平台与覆盖情况

此实现源自 Native，适配 Taro。微信端不运行 RN worklet 与 Expo 平台控件；媒体、地图、手势及 Canvas 导出请先查看[平台差异](/docs/platform)。

源码清单中的实现状态为 **${record.implementation}**，验收状态为 **${record.acceptance}**。导出与结构覆盖不能代替完整行为或真机验收。当前对齐版本为 **${pkg.version}**。
`;
  writeFile(
    path.join(docs, "components", `${entry.slug}.zh-CN.mdx`),
    chinese.replaceAll("](/docs", "](/zh-CN/docs")
  );

  catalogue.push({
    name: component,
    route: entry.route,
    slug: entry.slug,
    summary: entry.summary,
  });
}
writeFile(
  path.join(site, "lib/catalogue.json"),
  `${JSON.stringify(catalogue, null, 2)}\n`
);
writeFile(
  path.join(docs, "components/meta.json"),
  `${JSON.stringify(
    {
      defaultOpen: true,
      pages: catalogue.map((item) => item.slug),
      title: "Components",
    },
    null,
    2
  )}\n`
);
writeFile(
  path.join(docs, "components/index.mdx"),
  `${frontmatter(
    "Components",
    `${catalogue.length} Native-derived modules with Taro exports and WeChat examples.`
  )}Each page lists the actual Taro exports, type declarations and available WeChat example variants. These pages are an API reference; they do not claim full Native or device acceptance.\n\n${catalogue
    .map(
      (item) =>
        `## ${item.name}\n\n[${item.name}](/docs/components/${item.slug}) — ${item.summary}\n`
    )
    .join("\n")}`
);
console.log(
  `Generated ${catalogue.length} component references from package exports and source types.`
);

writeFile(
  path.join(docs, "components/meta.zh-CN.json"),
  `${JSON.stringify({ defaultOpen: true, pages: catalogue.map((item) => item.slug), title: "组件" }, null, 2)}\n`
);
writeFile(
  path.join(docs, "components/index.zh-CN.mdx"),
  `${frontmatter("组件", `${catalogue.length} 个源自 Native 的模块，提供 Taro 导出与微信示例。`)}每页列出实际 Taro 导出、类型声明和微信示例变体。API 参考不代表全部 Native 行为或真机验收已完成。\n\n${catalogue.map((item) => `## ${item.name}\n\n[${item.name}](/zh-CN/docs/components/${item.slug}) — 查看 API、组合结构与微信示例。\n`).join("\n")}`
);
