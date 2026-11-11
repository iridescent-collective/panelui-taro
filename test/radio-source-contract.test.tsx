// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { RadioGroup } from "../src/components/RadioGroup";

it("radio changes report only a different choice and remain controlled", () => {
  const change = vi.fn();
  render(
    <RadioGroup value="a" onValueChange={change}>
      <RadioGroup.Item value="a" label="甲" />
      <RadioGroup.Item value="b" label="乙" />
    </RadioGroup>
  );
  fireEvent.click(screen.getByRole("radio", { name: "甲" }));
  expect(change).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("radio", { name: "乙" }));
  expect(change).toHaveBeenCalledWith("b");
  expect(
    screen.getByRole("radio", { name: "乙" }).getAttribute("aria-checked")
  ).toBe("false");
});
it("horizontal cards share width, retain size-based dots, and can hide the indicator", () => {
  render(
    <RadioGroup
      variant="card"
      orientation="horizontal"
      size="xs"
      value="a"
      onValueChange={vi.fn()}
    >
      <RadioGroup.Item
        value="a"
        label="选项"
        description="说明"
        hideIndicator
      />
    </RadioGroup>
  );
  const option = screen.getByRole("radio");
  expect(option.className).toContain("flex-1");
  expect(option.className).toContain("min-h-[96px]");
  expect(option.className).toContain("bg-[var(--panel-accent)]");
  expect(option.textContent).toBe("选项说明");
  expect(option.querySelectorAll("div")).toHaveLength(1);
});
it("disabled group and individual item suppress selection requests", () => {
  const change = vi.fn();
  const { rerender } = render(
    <RadioGroup disabled onValueChange={change}>
      <RadioGroup.Item value="a">甲</RadioGroup.Item>
    </RadioGroup>
  );
  fireEvent.click(screen.getByRole("radio"));
  rerender(
    <RadioGroup onValueChange={change}>
      <RadioGroup.Item disabled value="a">
        甲
      </RadioGroup.Item>
    </RadioGroup>
  );
  fireEvent.click(screen.getByRole("radio"));
  expect(change).not.toHaveBeenCalled();
});
