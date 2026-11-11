import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import ts from "typescript";
import { expect, it } from "vitest";

const directory = path.resolve(import.meta.dirname, "../official");
const unbound: string[] = [];
const inert: string[] = [];
const stateOrAction = new Set([
  "onPress",
  "onValueChange",
  "onCheckedChange",
  "onRetry",
  "onTagPress",
  "onMentionPress",
]);
for (const file of readdirSync(directory).filter((name) =>
  name.endsWith(".tsx")
)) {
  const source = ts.createSourceFile(
    file,
    readFileSync(path.join(directory, file), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const location = (node: ts.Node) =>
    `${file}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}`;
  const visit = (node: ts.Node) => {
    if (
      ts.isJsxAttribute(node) &&
      stateOrAction.has(node.name.getText(source)) &&
      node.initializer &&
      ts.isJsxExpression(node.initializer)
    ) {
      const callback = node.initializer.expression;
      if (
        callback &&
        ts.isArrowFunction(callback) &&
        ts.isBlock(callback.body) &&
        callback.body.statements.length === 0
      )
        inert.push(location(node));
    }
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(source) === "Button"
    ) {
      const hasAction = node.attributes.properties.some(
        (attribute) =>
          ts.isJsxSpreadAttribute(attribute) ||
          (ts.isJsxAttribute(attribute) &&
            [
              "onPress",
              "onClick",
              "disabled",
              "loading",
              "type",
              "formType",
              "openType",
            ].includes(attribute.name.getText(source)))
      );
      const element = ts.isJsxOpeningElement(node) ? node.parent : node;
      const parent = element.parent;
      const inherited =
        ts.isJsxElement(parent) &&
        /\.(Trigger|Close|Dismiss|Back|Cancel|Action)$/.test(
          parent.openingElement.tagName.getText(source)
        );
      if (!hasAction && !inherited) unbound.push(location(node));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

it("gives enabled standalone demo buttons an action while preserving compound triggers and disabled states", () =>
  expect(unbound).toEqual([]));
it("keeps state controls, retry and press actions free of empty callbacks", () =>
  expect(inert).toEqual([]));
