// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import {
  ToggleButton,
  ToggleButtonGroup,
  useToggleButton,
} from "../src/components/ToggleButton";

const State = () => (
  <ToggleButton.Label>
    {useToggleButton().selected ? "开" : "关"}
  </ToggleButton.Label>
);
it("standalone switches locally and controlled values remain parent-owned", () => {
  const change = vi.fn();
  const { rerender } = render(
    <ToggleButton onSelectedChange={change}>
      <State />
    </ToggleButton>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByText("开")).toBeTruthy();
  expect(change).toHaveBeenCalledWith(true);
  rerender(
    <ToggleButton selected={false} onSelectedChange={change}>
      <State />
    </ToggleButton>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByText("关")).toBeTruthy();
});
it("single selection clears on repeat and group owns selection over individual props", () => {
  const change = vi.fn();
  render(
    <ToggleButtonGroup
      selectionMode="single"
      defaultValue={["a"]}
      onValueChange={change}
    >
      <ToggleButton id="a" selected={false}>
        甲
      </ToggleButton>
      <ToggleButton id="b">乙</ToggleButton>
    </ToggleButtonGroup>
  );
  expect(
    screen.getByRole("button", { name: "甲" }).getAttribute("aria-pressed")
  ).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "乙" }));
  expect(change).toHaveBeenLastCalledWith(["b"]);
  fireEvent.click(screen.getByRole("button", { name: "乙" }));
  expect(change).toHaveBeenLastCalledWith([]);
});
it("multiple groups inherit size, ghost variant, and disabled state", () => {
  const change = vi.fn();
  render(
    <ToggleButtonGroup
      disabled
      size="xs"
      variant="ghost"
      onValueChange={change}
    >
      <ToggleButton id="bold" iconOnly accessibilityLabel="加粗">
        B
      </ToggleButton>
    </ToggleButtonGroup>
  );
  const button = screen.getByRole("button", { name: "加粗" });
  fireEvent.click(button);
  expect(change).not.toHaveBeenCalled();
  expect(button.className).toContain("w-[56px]");
  expect(button.className).toContain("bg-transparent");
});
