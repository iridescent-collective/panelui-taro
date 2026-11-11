import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

import { completeSpecifier, verifyPackageEntries } from "./package-build-contract.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const filesIn = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
const destination = path.join(root, "dist");
rmSync(destination, { recursive: true, force: true });
execFileSync(
  process.execPath,
  [require.resolve("typescript/bin/tsc"), "-p", "tsconfig.build.json"],
  { cwd: root, stdio: "inherit" },
);
// Preserve styles, Taro plugins, JSON, vendored JS/declarations and notices.
for (const file of filesIn(path.join(root, "src"))) {
  if (/\.tsx?$/.test(file) && !file.endsWith(".d.ts")) continue;
  const target = path.join(destination, path.relative(path.join(root, "src"), file));
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(file, target);
}
const files = filesIn(destination);
const relative = (file) => path.relative(root, file).split(path.sep).join("/");
const inventory = new Set(files.map(relative));
for (const file of files) {
  if (!/\.(?:js|cjs|ts)$/.test(file)) continue;
  const source = readFileSync(file, "utf8");
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const edits = [];
  const visit = (node) => {
    let literal;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
      literal = node.moduleSpecifier;
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument))
      literal = node.argument.literal;
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require"))
    )
      literal = node.arguments[0];
    if (literal && ts.isStringLiteral(literal)) {
      const next = completeSpecifier(relative(file), literal.text, inventory);
      if (next !== literal.text)
        edits.push({ start: literal.getStart(ast), end: literal.end, value: JSON.stringify(next) });
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  let result = source;
  for (const edit of edits.toSorted((a, b) => b.start - a.start))
    result = result.slice(0, edit.start) + edit.value + result.slice(edit.end);
  if (result !== source) writeFileSync(file, result);
}
const packageFiles = new Set([
  ...inventory,
  ...filesIn(path.join(root, "src")).map(relative),
  "package.json",
]);
verifyPackageEntries(
  JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")),
  packageFiles,
);
console.log(
  `Built ${files.filter((file) => file.endsWith(".js")).length} JavaScript modules and ${files.filter((file) => file.endsWith(".d.ts")).length} declarations, with styles, platform assets and notices.`,
);
