import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
if (!sourceRoot) {
  throw new Error("Provide the pinned PanelUI checkout path");
}
const sourceCommit = execFileSync(
  "git",
  ["-C", sourceRoot, "rev-parse", "HEAD"],
  { encoding: "utf-8" }
).trim();
if (sourceCommit !== "3812a4509eb8b935b14a4f8f173a82d603030491") {
  throw new Error("Source checkout differs from the pinned commit");
}
const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const metadata = JSON.parse(
  fs.readFileSync(path.join(packageRoot, "package.json"), "utf-8")
);
const catalogue = JSON.parse(
  fs.readFileSync(path.join(sourceRoot, "catalogue.json"), "utf-8")
);
const modules = catalogue.componentModules;
if (modules.length !== 140 || new Set(modules).size !== 140) {
  throw new Error("Unexpected source catalogue");
}
const walk = (folder) =>
  fs.readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(folder, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
const api = (file) => {
  const code = fs.readFileSync(file, "utf-8");
  const source = ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const exports = new Set();
  const parts = new Set();
  for (const node of source.statements) {
    if (
      ts.isExportDeclaration(node) &&
      node.exportClause &&
      ts.isNamedExports(node.exportClause)
    ) {
      for (const entry of node.exportClause.elements) {
        exports.add(entry.name.text);
      }
    }
    if (
      !node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      )
    ) {
      continue;
    }
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          exports.add(declaration.name.text);
        }
        const value = declaration.initializer;
        if (
          value &&
          ts.isCallExpression(value) &&
          value.expression.getText(source) === "Object.assign"
        ) {
          const [, object] = value.arguments;
          if (object && ts.isObjectLiteralExpression(object)) {
            for (const property of object.properties) {
              if (property.name) {
                parts.add(
                  property.name.getText(source).replaceAll(/["']/gu, "")
                );
              }
            }
          }
        }
      }
    } else if (node.name && ts.isIdentifier(node.name)) {
      exports.add(node.name.text);
    }
  }
  return { exports: [...exports].toSorted(), parts: [...parts].toSorted() };
};
const previousManifest = JSON.parse(
  fs.readFileSync(path.join(packageRoot, "source-manifest.json"), "utf-8")
);
const supplementalRecords = previousManifest.supplementalRecords ?? [];
const alignments = previousManifest.alignments ?? [];
const records = modules.map((module) => {
  const directory = path.join(
    sourceRoot,
    "packages/panelui/src/components",
    module
  );
  const sourceApi = api(path.join(directory, "index.tsx"));
  const configuredEntry = metadata.exports[`./${module}`];
  const entry =
    typeof configuredEntry === "string"
      ? configuredEntry
      : configuredEntry?.default;
  const target = entry ? path.join(packageRoot, entry) : undefined;
  const targetApi =
    target && fs.existsSync(target) ? api(target) : { exports: [], parts: [] };
  return {
    acceptance: "pending",
    implementation: target ? "partial" : "pending",
    missingExports: sourceApi.exports.filter(
      (name) => !targetApi.exports.includes(name)
    ),
    missingParts: sourceApi.parts.filter(
      (name) => !targetApi.parts.includes(name)
    ),
    module,
    sourceApi,
    sourceFiles: walk(directory).map((file) => ({
      path: path.relative(sourceRoot, file),
      sha256: crypto
        .createHash("sha256")
        .update(fs.readFileSync(file))
        .digest("hex"),
    })),
    target: entry ?? null,
    targetApi,
  };
});
fs.writeFileSync(
  path.join(packageRoot, "source-manifest.json"),
  `${JSON.stringify({ alignments, catalogueCount: 140, records, sourceCommit, supplementalRecords }, null, 2)}\n`
);
