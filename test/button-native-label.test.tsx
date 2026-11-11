// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Button } from "../src/components/Button";

it("preserves native aria-label while accepting accessibilityLabel", () => {
  const { rerender } = render(<Button aria-label="展开知识图谱" />);
  expect(screen.getByRole("button", { name: "展开知识图谱" })).toBeTruthy();
  rerender(<Button native aria-label="选择头像" />);
  expect(screen.getByRole("button", { name: "选择头像" })).toBeTruthy();
  rerender(<Button aria-label="原生名称" accessibilityLabel="明确名称" />);
  expect(screen.getByRole("button", { name: "明确名称" })).toBeTruthy();
});

it("preserves custom pressed styles and suppresses them when disabled", () => {
  const { rerender } = render(
    <Button hoverClass="app-btn--active">保存</Button>
  );
  expect(
    screen.getByRole("button", { name: "保存" }).getAttribute("hoverclass")
  ).toBe("app-btn--active");
  rerender(<Button hoverClass="none">选择头像</Button>);
  expect(
    screen.getByRole("button", { name: "选择头像" }).getAttribute("hoverclass")
  ).toBe("none");
  rerender(
    <Button disabled hoverClass="app-btn--active">
      保存
    </Button>
  );
  expect(
    screen.getByRole("button", { name: "保存" }).getAttribute("hoverclass")
  ).toBe("none");
});
