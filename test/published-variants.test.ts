import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { expect, it } from "vitest";

const requireExample = createRequire(
  new URL("../example/package.json", import.meta.url)
);
const { transformWithEsbuild } = requireExample("vite");

it("ships an ES2015 variants runtime without consumer workspace patches", async () => {
  const root = new URL("../", import.meta.url);
  const pkg = JSON.parse(readFileSync(new URL("package.json", root), "utf-8"));
  expect(pkg.dependencies).not.toHaveProperty("tailwind-variants");
  const directory = new URL("src/vendor/tailwind-variants/", root);
  for (const name of readdirSync(directory).filter((file) =>
    file.endsWith(".js")
  )) {
    const source = readFileSync(new URL(name, directory), "utf-8");
    await expect(
      transformWithEsbuild(source, fileURLToPath(new URL(name, directory)), {
        target: "es2015",
      })
    ).resolves.toHaveProperty("code");
    expect(source).not.toMatch(/from ["']tailwind-variants/u);
  }
});
