import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import ts from "typescript";

const root = path.resolve(import.meta.dirname, "..");
const file = path.resolve(root, "../src/icons/index.tsx");
const source = ts.createSourceFile(
  file,
  readFileSync(file, "utf-8"),
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const names = new Set();
for (const statement of source.statements) {
  if (
    ts.isVariableStatement(statement) &&
    statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
    )
  ) {
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        /^[A-Z].*Icon$/u.test(declaration.name.text)
      ) {
        names.add(declaration.name.text);
      }
    }
  }
  if (
    ts.isExportDeclaration(statement) &&
    statement.exportClause &&
    ts.isNamedExports(statement.exportClause)
  ) {
    for (const entry of statement.exportClause.elements) {
      if (
        !statement.isTypeOnly &&
        !entry.isTypeOnly &&
        /^[A-Z].*Icon$/u.test(entry.name.text)
      ) {
        names.add(entry.name.text);
      }
    }
  }
}
const sorted = [...names].toSorted();
const output = `import { ${sorted.join(", ")} } from "panelui-taro/icons";\nimport type { IconEntry } from "../types";\n\nexport const ICON_CATALOG: readonly IconEntry[] = [\n${sorted.map((name) => `  { Icon: ${name}, name: "${name}" },`).join("\n")}\n];\n`;
writeFileSync(path.join(root, "src/customization/data/icons.ts"), output);
console.info(`Generated ${sorted.length} ported Native icons`);
