import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

import ts from "typescript";

const [sourceRoot] = process.argv.slice(2);
const relative =
  "packages/panelui/src/components/markdown-editor/markdown-transforms.ts";
const pinned = "b0aec40f8674dbe7f467be377bc3544359711ab0";
const source = fs.readFileSync(path.join(sourceRoot, relative), "utf-8");
if (
  source !==
  execFileSync("git", ["-C", sourceRoot, "show", `${pinned}:${relative}`], {
    encoding: "utf-8",
  })
) {
  throw new Error("Source differs from pinned commit");
}
const sandbox = { exports: {} };
vm.createContext(sandbox);
vm.runInContext(
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  sandbox,
  { timeout: 1000 }
);
const api = sandbox.exports;
const frames = [];
for (const text of [
  "",
  "hello",
  "**hello**",
  "_hello_",
  "one\ntwo",
  "- hello",
  "- ",
  "  3. hello",
  "## heading\nparagraph",
  "```\ncode\n```",
  "[hello](url)",
]) {
  for (const selection of [
    { end: 0, start: 0 },
    { end: text.length, start: 0 },
    { end: 7, start: 2 },
    { end: text.length, start: text.length },
    { end: 999, start: -4 },
  ]) {
    for (const kind of [
      "bold",
      "italic",
      "heading",
      "quote",
      "code",
      "bulletList",
      "orderedList",
      "link",
      "image",
      "continueList",
    ]) {
      let output;
      if (kind === "bold" || kind === "italic") {
        output = api.toggleWrap(text, selection, kind === "bold" ? "**" : "_");
      } else if (
        kind === "heading" ||
        kind === "quote" ||
        kind === "bulletList"
      ) {
        output = api.toggleLinePrefix(
          text,
          selection,
          { bulletList: "- ", heading: "## ", quote: "> " }[kind]
        );
      } else {
        output = api[
          {
            code: "toggleFence",
            continueList: "continueList",
            image: "insertImage",
            link: "insertLink",
            orderedList: "toggleOrderedList",
          }[kind]
        ](text, selection);
      }
      frames.push({ kind, output, selection, text });
    }
  }
}
fs.writeFileSync(
  new URL("../test/fixtures/markdown-editor-source.json", import.meta.url),
  `${JSON.stringify({ frames, pinned }, null, 2)}\n`
);
