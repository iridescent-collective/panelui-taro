import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { expect, it } from "vitest";

import metadata from "../package.json";
import manifest from "../source-manifest.json";

it("source inventory retains all 140 modules and never infers acceptance from an entry file", () => {
  expect(manifest.catalogueCount).toBe(140);
  expect(new Set(manifest.records.map((record) => record.module)).size).toBe(140);
  for (const record of manifest.records) {
    expect(record.acceptance).toBe("pending");
    const declaredEntry = metadata.exports[`./${record.module}` as keyof typeof metadata.exports];
    expect(Boolean(record.target)).toBe(Boolean(declaredEntry));
    if (!record.target) {
      expect(record.implementation).toBe("pending");
      continue;
    }
    expect(record.implementation).toBe("partial");
    expect(record.missingExports).toEqual([]);
    expect(record.missingParts).toEqual([]);
    const path = fileURLToPath(new URL(`../${record.target}`, import.meta.url));
    expect(fs.existsSync(path)).toBe(true);
    const entry = metadata.exports[`./${record.module}` as keyof typeof metadata.exports];
    if (typeof entry === "string") {
      expect(entry).toBe(record.target);
    } else {
      const compiled = record.target.replace("./src/", "./dist/").replace(/\.tsx?$/, "");
      expect(entry).toEqual({
        default: `${compiled}.js`,
        source: record.target,
        types: `${compiled}.d.ts`,
      });
    }
  }
});
