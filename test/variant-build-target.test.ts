import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import type { transformWithEsbuild as EsbuildTransform } from "vite";
import { expect, it } from "vitest";

const requireExample = createRequire(
  new URL("../example/package.json", import.meta.url)
);
const { transformWithEsbuild } = requireExample("vite") as {
  transformWithEsbuild: typeof EsbuildTransform;
};

it("compiles the variants class joiner for WeChat's ES2015 build target", async () => {
  const url = new URL(
    "../src/vendor/tailwind-variants/lite.js",
    import.meta.url
  ).href;
  const entry = readFileSync(fileURLToPath(url), "utf-8");
  const chunks = [
    ...entry.matchAll(/from ['"](?<chunk>.\/chunk-[^'"]+)['"]/gu),
  ];
  const sources = chunks.map((match) =>
    readFileSync(fileURLToPath(new URL(match.groups!.chunk, url)), "utf-8")
  );
  const source = sources.find((code) => code.includes("joinClassValue"));
  expect(source).toBeDefined();
  await expect(
    transformWithEsbuild(source!, "class-joiner.js", { target: "es2015" })
  ).resolves.toHaveProperty("code");
});
