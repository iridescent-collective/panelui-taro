import assert from "node:assert/strict";
import path from "node:path";

export function completeSpecifier(file, specifier, files) {
  assert.ok(!specifier.includes(".pnpm/"), `Nonportable import in ${file}: ${specifier}`);
  if (!specifier.startsWith(".")) return specifier;
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
  if (files.has(target)) return specifier;
  if (file.endsWith(".d.ts") && target.endsWith(".js") && files.has(target.slice(0, -3) + ".d.ts"))
    return specifier;
  if (files.has(target + ".js")) return specifier + ".js";
  if (files.has(target + "/index.js")) return specifier.replace(/\/$/, "") + "/index.js";
  if (file.endsWith(".d.ts") && files.has(target + ".d.ts")) return specifier + ".js";
  throw new Error(`Unresolved import in ${file}: ${specifier}`);
}

export function verifyPackageEntries(pkg, files) {
  const visit = (value, condition = "default") => {
    if (typeof value === "string") {
      assert.ok(
        value.startsWith("./") && !value.includes("/../"),
        `Invalid package entry: ${value}`,
      );
      assert.ok(
        condition === "source" || !/\.(?:ts|tsx)$/.test(value) || value.endsWith(".d.ts"),
        `Expected a compiled package entry: ${value}`,
      );
      assert.ok(files.has(value.slice(2)), `Missing package entry: ${value}`);
      if (condition === "types")
        assert.ok(
          value.endsWith(".d.ts") || value.endsWith(".json"),
          `Expected declarations: ${value}`,
        );
    } else {
      for (const [key, target] of Object.entries(value)) visit(target, key);
    }
  };
  for (const target of Object.values(pkg.exports)) visit(target);
  for (const mappings of Object.values(pkg.typesVersions ?? {})) {
    for (const targets of Object.values(mappings)) {
      for (const target of targets) {
        assert.ok(files.has(target), `Missing legacy type mapping: ${target}`);
        assert.ok(
          target.endsWith(".d.ts") || target.endsWith(".json"),
          `Expected a declaration mapping: ${target}`,
        );
      }
    }
  }
}
