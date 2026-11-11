// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import path from "node:path";

import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import ts from "typescript";
import { expect, it, vi } from "vitest";

import { PreviewCatalog } from "../components/PreviewCatalog";

const unmountFirst = vi.fn();
vi.mock("@/components/PreviewCatalog/catalogue", async () => {
  const { useEffect, createElement } = await import("react");
  const First = () => {
    useEffect(() => () => unmountFirst(), []);
    return <span>First sample</span>;
  };
  const Second = () => createElement("span", null, "Second sample");
  return {
    PREVIEW_STORIES: [
      { component: First, id: "first", label: "First", modules: ["button"] },
      { component: Second, id: "second", label: "Second", modules: ["card"] },
    ],
  };
});
vi.mock("@tarojs/components", () => ({
  View: ({ children, id }: { children?: ReactNode; id?: string }) => (
    <div id={id}>{children}</div>
  ),
}));
vi.mock("panelui-taro/typography", () => ({
  Typography: {
    Paragraph: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
  },
}));
vi.mock("panelui-taro/select", async () => {
  const { Children, cloneElement, isValidElement, createElement } =
    await import("react");
  interface Choice {
    value: string;
    label: string;
    onSelect?: () => void;
  }
  const Item = ({ label, onSelect }: Choice) =>
    createElement("button", { onClick: onSelect }, label);
  const Root = ({
    children,
    onValueChange,
  }: {
    children?: ReactNode;
    onValueChange: (value: string) => void;
  }) => (
    <div>
      {Children.map(children, (child) =>
        isValidElement<Choice>(child)
          ? cloneElement(child, {
              onSelect: () => onValueChange(child.props.value),
            })
          : child
      )}
    </div>
  );
  return { Select: Object.assign(Root, { Item }) };
});

it("mounts only the selected sample and cleans up the previous sample on change", () => {
  render(<PreviewCatalog />);
  expect(screen.getByText("First sample")).toBeTruthy();
  expect(screen.queryByText("Second sample")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Second" }));
  expect(screen.getByText("Second sample")).toBeTruthy();
  expect(screen.queryByText("First sample")).toBeNull();
  expect(unmountFirst).toHaveBeenCalledOnce();
  expect(screen.getByText("card")).toBeTruthy();
});

it("declares a preview for every implemented upstream module", () => {
  const cataloguePath = path.resolve(
    import.meta.dirname,
    "../components/PreviewCatalog/catalogue.ts"
  );
  const source = ts.createSourceFile(
    cataloguePath,
    readFileSync(cataloguePath, "utf-8"),
    ts.ScriptTarget.Latest,
    true
  );
  const covered = new Set<string>();
  const visit = (node: ts.Node) => {
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText(source) === "modules" &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const entry of node.initializer.elements) {
        if (ts.isStringLiteral(entry)) {
          covered.add(entry.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  const manifest: { records: { module: string; implementation: string }[] } =
    JSON.parse(
      readFileSync(
        path.resolve(import.meta.dirname, "../../../source-manifest.json"),
        "utf-8"
      )
    );
  const implemented = manifest.records
    .filter((record) => record.implementation === "partial")
    .map((record) => record.module);
  expect(implemented.filter((module) => !covered.has(module))).toEqual([]);
});
