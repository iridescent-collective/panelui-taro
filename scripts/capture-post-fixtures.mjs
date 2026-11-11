import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const root = process.argv[2] ?? "/Users/iridescent/front_end/PanelUI";
const commit = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const relative = "packages/panelui/src/components/post/index.tsx";
const source = fs.readFileSync(path.join(root, relative), "utf-8");
if (
  source !==
  execFileSync("git", ["show", `${commit}:${relative}`], {
    cwd: root,
    encoding: "utf-8",
  })
) {
  throw new Error("Post source differs from pinned revision");
}
const file = ts.createSourceFile(
  relative,
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
const printer = ts.createPrinter({ removeComments: true });
const functions = file.statements.filter(
  (node) =>
    ts.isFunctionDeclaration(node) &&
    ["tokenize", "numeric", "initials"].includes(node.name?.text)
);
const executable = `${functions.map((node) => printer.printNode(ts.EmitHint.Unspecified, node, file)).join("\n")}\nexports.tokenize=tokenize;exports.numeric=numeric;exports.initials=initials;`;
const exports = {};
vm.runInNewContext(
  ts.transpileModule(executable, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  { exports },
  { timeout: 1000 }
);
const tokens = [
  "",
  "Plain text",
  "Read #DebtSnowball.",
  "@sam_01 #Learning-now!",
  "#tag,#next?",
  "Email x@host.com",
  "中文 #孩子 #learning",
  "a##double@@person",
  "#123  @a-b_2",
  "line\n#first\n@second",
];
const numbers = [
  0,
  -1,
  215,
  "5,874",
  " 1 200 ",
  "Save",
  "",
  "2.5",
  "Infinity",
  null,
];
const names = ["Dwayne F. White", "小仓栗", "  Leading Space ", "one", ""];
fs.writeFileSync(
  new URL("../test/fixtures/post-source.json", import.meta.url),
  `${JSON.stringify({ commit, initials: names.map((input) => ({ input, result: exports.initials(input) })), numeric: numbers.map((input) => ({ input, result: exports.numeric(input) })), tokens: tokens.map((input) => ({ input, result: exports.tokenize(input) })) }, null, 2)}\n`
);
