// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Input } from "../src/components/Input";

it("preserves native input labels and explicit accessibility label priority", () => {
  const { rerender } = render(<Input aria-label="显示名" />);
  expect(screen.getByRole("textbox", { name: "显示名" })).toBeTruthy();
  rerender(<Input ariaLabel="留言内容" />);
  expect(screen.getByRole("textbox", { name: "留言内容" })).toBeTruthy();
  rerender(<Input multiline aria-label="详细反馈" />);
  expect(screen.getByRole("textbox", { name: "详细反馈" })).toBeTruthy();
  rerender(<Input aria-label="原生名称" accessibilityLabel="明确名称" />);
  expect(screen.getByRole("textbox", { name: "明确名称" })).toBeTruthy();
  rerender(<Input label="孩子姓名" />);
  expect(screen.getByRole("textbox", { name: "孩子姓名" })).toBeTruthy();
});
