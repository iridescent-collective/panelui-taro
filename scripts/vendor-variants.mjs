import { createHash } from "node:crypto";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
} from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const entry = require
  .resolve("tailwind-variants/lite")
  .replace(/\.cjs$/u, ".js");
const upstream = path.dirname(path.dirname(entry));
const pkg = JSON.parse(
  readFileSync(path.join(upstream, "package.json"), "utf-8")
);
if (pkg.version !== "3.3.1") {
  throw new Error(
    `Review the compatibility transform before vendoring tailwind-variants ${pkg.version}`
  );
}
const destination = path.join(root, "src/vendor/tailwind-variants");
rmSync(destination, { force: true, recursive: true });
mkdirSync(destination, { recursive: true });
const pending = [entry, entry.replace(/\.js$/u, ".d.ts")];
const copied = new Map();
while (pending.length) {
  const file = pending.pop();
  if (copied.has(file)) {
    continue;
  }
  const input = readFileSync(file, "utf-8");
  const original = file.endsWith(".d.ts")
    ? input.replaceAll(/[ \t]+$/gmu, "")
    : input;
  const code = file.endsWith(".d.ts")
    ? original
    : original.replaceAll(
        /(?<value>value|item) !== 0n/gu,
        'typeof $<value> !== "bigint"'
      );
  if (!file.endsWith(".d.ts") && /\b\d+n\b/u.test(code)) {
    throw new Error(`Unreviewed BigInt literal in ${path.basename(file)}`);
  }
  copied.set(file, code);
  writeFileSync(path.join(destination, path.basename(file)), code);
  for (const match of code.matchAll(
    /(?:from\s*|import\s*)["'](?<dependency>\.\/[^"']+)["']/gu
  )) {
    let dependency = path.resolve(path.dirname(file), match.groups.dependency);
    if (file.endsWith(".d.ts")) {
      dependency = dependency.replace(/\.js$/u, ".d.ts");
    }
    if (!existsSync(dependency)) {
      throw new Error(`Missing vendored dependency: ${dependency}`);
    }
    pending.push(dependency);
  }
}
writeFileSync(
  path.join(destination, "LICENSE"),
  readFileSync(path.join(upstream, "LICENSE"))
);
writeFileSync(
  path.join(destination, "provenance.json"),
  `${JSON.stringify(
    {
      files: Object.fromEntries(
        [...copied].map(([file, code]) => [
          path.basename(file),
          createHash("sha256").update(code).digest("hex"),
        ])
      ),
      package: pkg.name,
      repository: pkg.repository.url,
      transform:
        "Replace falsy BigInt zero guards with equivalent typeof checks for ES2015 parsing.",
      version: pkg.version,
    },
    null,
    2
  )}\n`
);
console.log(
  `Vendored ${copied.size} runtime and declaration files from ${pkg.name}@${pkg.version}.`
);
