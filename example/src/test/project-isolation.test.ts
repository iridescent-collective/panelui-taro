import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { expect, it } from "vitest";

const project = path.resolve(import.meta.dirname, "../..");
const sources = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? sources(file) : [file];
  });

it("keeps example source imports independent of the business mini program", () => {
  for (const directory of ["src", "config", "scripts"]) {
    for (const file of sources(path.join(project, directory))) {
      if (!/\.(?:tsx?|m?js|cjs|scss|css)$/u.test(file)) {
        continue;
      }
      const source = readFileSync(file, "utf-8");
      for (const match of source.matchAll(
        /(?:from\s+|import\s*\(?|require\s*\()\s*["'](?<specifier>[^"']+)["']/gu
      )) {
        const { specifier } = match.groups as { specifier: string };
        const resolved = path.resolve(path.dirname(file), specifier);
        expect(resolved, `${file}: ${specifier}`).not.toContain("/apps/mini/");
        expect(specifier, file).not.toBe("mini");
      }
    }
  }
});
