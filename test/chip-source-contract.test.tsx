// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Chip, useChip } from "../src/components/Chip";
import { CheckIcon } from "../src/icons";
import { readTaroStyle } from "./taro-style";

const State = () => {
  const state = useChip();
  return <Chip.Label>{state.selected ? "已选" : "未选"}</Chip.Label>;
};
it("nested close removes without bubbling into the chip press and disabled suppresses both", () => {
  const close = vi.fn();
  const press = vi.fn();
  const { rerender } = render(
    <Chip onPress={press} onClose={close}>
      设计
    </Chip>
  );
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect(close).toHaveBeenCalledOnce();
  expect(press).not.toHaveBeenCalled();
  rerender(
    <Chip disabled onPress={press} onClose={close}>
      设计
    </Chip>
  );
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect(close).toHaveBeenCalledOnce();
  expect(press).not.toHaveBeenCalled();
});
it("selected state overrides variant colors and compound labels/icons inherit it", () => {
  const { container, rerender } = render(
    <Chip selected variant="primary">
      <CheckIcon />
      <State />
    </Chip>
  );
  expect(screen.getByText("已选").className).toContain(
    "--panel-accent-foreground"
  );
  expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true");
  const svg = decodeURIComponent(
    container.querySelector("img")?.getAttribute("src")?.split(",")[1] ?? ""
  );
  expect(svg).toContain('stroke="#262626"');
  rerender(<Chip>静态</Chip>);
  expect(screen.queryByRole("button")).toBeNull();
});
it("five close targets scale with the pill and expose source hook state", () => {
  const { container } = render(
    <Chip size="xs" onClose={() => {}} selected={false}>
      <State />
    </Chip>
  );
  expect(screen.getByText("未选")).toBeTruthy();
  expect(
    readTaroStyle(screen.getByRole("button", { name: "Remove" }))
  ).toContain('"width":"28rpx"');
  expect(container.firstElementChild?.className).toContain("h-[40px]");
});
it("Taro onClick chips keep the source disabled guard and pressable semantics", () => {
  const click = vi.fn();
  const { rerender } = render(
    <Chip disabled onClick={click}>
      Native click
    </Chip>
  );
  fireEvent.click(screen.getByText("Native click"));
  expect(click).not.toHaveBeenCalled();
  rerender(<Chip onClick={click}>Native click</Chip>);
  fireEvent.click(screen.getByRole("button", { name: "Native click" }));
  expect(click).toHaveBeenCalledOnce();
});
it("Taro onClick removal does not also activate its parent chip", () => {
  const click = vi.fn();
  const close = vi.fn();
  render(
    <Chip onClick={click} onClose={close}>
      Removable click
    </Chip>
  );
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect(close).toHaveBeenCalledOnce();
  expect(click).not.toHaveBeenCalled();
});
