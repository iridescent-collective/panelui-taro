import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

import { expect, it } from "vitest";

import blocks from "../data/blocks.json";
import components from "../data/components.json";
import original from "../official/metadata.json";

const root = path.resolve(import.meta.dirname, "..");
it("gives all 141 upstream components an individual page and their original variant names", () => {
  expect(components).toHaveLength(141);
  expect(new Set(components.map((item) => item.route)).size).toBe(141);
  for (const item of components) {
    expect(existsSync(path.join(root, `${item.route}.tsx`))).toBe(true);
    expect(item.variants).toEqual(
      original.find((source) => source.slug === item.slug)?.variants
    );
    expect(
      readFileSync(path.join(root, `${item.route}.tsx`), "utf-8")
    ).toContain(`@/official/${item.slug}`);
  }
});
it("shows exactly the four official Blocks without the custom app templates", () => {
  expect(new Set(blocks.map((item) => item.slug))).toEqual(
    new Set(["activity", "boarding-pass", "smart-home", "wallet"])
  );
  for (const block of blocks) {
    expect(
      readFileSync(path.join(root, `${block.route}.tsx`), "utf-8")
    ).toContain(`@/blocks/${block.slug}`);
  }
});
