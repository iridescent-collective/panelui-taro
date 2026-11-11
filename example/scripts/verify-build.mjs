import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const distRoot = path.resolve(
  import.meta.dirname,
  "..",
  process.env.TARO_OUTPUT_ROOT || "dist"
);
const config = JSON.parse(
  readFileSync(path.join(distRoot, "app.json"), "utf-8")
);
assert.deepEqual(config.pages, ["pages/index/index"]);
const componentPages = JSON.parse(
  readFileSync(
    path.resolve(import.meta.dirname, "../src/data/components.json"),
    "utf-8"
  )
);
const blockPages = JSON.parse(
  readFileSync(
    path.resolve(import.meta.dirname, "../src/data/blocks.json"),
    "utf-8"
  )
);
const customizationPages = JSON.parse(
  readFileSync(
    path.resolve(import.meta.dirname, "../src/data/customization.json"),
    "utf-8"
  )
);
assert.equal(customizationPages.length, 7);
assert.equal(componentPages.length, 141);
assert.equal(blockPages.length, 4);
const registered = new Set([
  ...config.pages,
  ...config.subPackages.flatMap((group) =>
    group.pages.map((page) => `${group.root}/${page}`)
  ),
]);
for (const page of [...componentPages, ...blockPages, ...customizationPages]) {
  assert.ok(registered.has(page.route.slice(1)), `Missing page: ${page.route}`);
  for (const extension of ["js", "json", "wxml", "wxss"]) {
    readFileSync(path.join(distRoot, `${page.route}.${extension}`));
  }
}
const files = [
  "common.js",
  ...componentPages.map((page) => `${page.route.slice(1)}.js`),
  ...blockPages.map((page) => `${page.route.slice(1)}.js`),
  ...customizationPages.map((page) => `${page.route.slice(1)}.js`),
];
for (const file of files) {
  const code = readFileSync(path.join(distRoot, file), "utf-8");
  assert.ok(
    !/(?:bg|text|rounded)-\[(?:color:|length:)?(?:var\(--panel-|inherit)/u.test(
      code
    ),
    `${file}: PanelUI class names must be escaped for WXSS`
  );
}
const template = readFileSync(path.join(distRoot, "base.wxml"), "utf-8");
for (const attribute of ["aria-role", "aria-label", "aria-checked"]) {
  assert.ok(
    template.includes(`${attribute}=`),
    `WeChat template must retain ${attribute}`
  );
}
const css = readFileSync(path.join(distRoot, "app-origin.wxss"), "utf-8");
assert.match(
  css,
  /--panel-primary:\s*#262626/u,
  "Panel default primary token must be present"
);

const byteSize = (directory) => {
  let total = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    total += entry.isDirectory() ? byteSize(file) : statSync(file).size;
  }
  return total;
};
let allSubpackageBytes = 0;
for (const group of config.subPackages) {
  const bytes = byteSize(path.join(distRoot, group.root));
  allSubpackageBytes += bytes;
  assert.ok(bytes < 2 * 1024 * 1024, `${group.root} exceeds 2 MiB: ${bytes}`);
}
const mainBytes = byteSize(distRoot) - allSubpackageBytes;
assert.ok(
  mainBytes < 2 * 1024 * 1024,
  `Main package exceeds 2 MiB: ${mainBytes}`
);
console.info(
  `PanelUI docs verified: 141 component pages, 4 blocks, 7 customization pages, main ${mainBytes} bytes`
);
