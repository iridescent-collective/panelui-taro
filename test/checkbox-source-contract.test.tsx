// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import type { ComponentRef } from "react";
import { expect, it, vi } from "vitest";

import { Checkbox } from "../src/components/Checkbox";
import { Text } from "../src/components/primitives/Text";

it("mixed resolves upward without taking controlled ownership", () => {
  const change = vi.fn();
  render(
    <Checkbox
      checked={false}
      indeterminate
      label="全选"
      onCheckedChange={change}
    />
  );
  const box = screen.getByRole("checkbox");
  expect(box.getAttribute("aria-checked")).toBe("mixed");
  fireEvent.click(box);
  expect(change).toHaveBeenCalledWith(true);
  expect(box.getAttribute("aria-checked")).toBe("mixed");
});

it("disabled suppresses changes and preserves the source touch target at xs", () => {
  const change = vi.fn();
  render(
    <Checkbox
      checked
      disabled
      size="xs"
      label="禁止修改"
      onCheckedChange={change}
    />
  );
  const box = screen.getByRole("checkbox");
  fireEvent.click(box);
  expect(change).not.toHaveBeenCalled();
  expect(box.className).toContain("min-h-[96px]");
  expect(box.getAttribute("aria-disabled")).toBe("true");
});

it("card renders content before the glyph and ref points to the pressable", () => {
  const ref = createRef<ComponentRef<typeof Checkbox>>();
  render(
    <Checkbox
      ref={ref}
      variant="card"
      checked
      label="教材"
      description="一年级"
    />
  );
  const box = screen.getByRole("checkbox");
  expect(ref.current).toBe(box);
  expect(box.firstElementChild?.textContent).toBe("教材一年级");
  expect(box.className).toContain("bg-[var(--panel-accent)]");
});

it("plain unchecked toggles true and explicit text classes override defaults", () => {
  const change = vi.fn();
  render(
    <Checkbox
      checked={false}
      label="选项"
      labelClassName="text-[36px]"
      onCheckedChange={change}
    />
  );
  fireEvent.click(screen.getByRole("checkbox"));
  expect(change).toHaveBeenCalledWith(true);
  expect(screen.getByText("选项").className).toContain("text-[36px]");
  expect(screen.getByText("选项").className).not.toContain("text-[28px]");
});

it("lets content shrink beside another action and preserves explicit accessible names", () => {
  render(
    <Checkbox
      checked={false}
      label="Remember me"
      contentClassName="flex-none"
      aria-label="Remember this device"
      id="remember"
      style={{ marginTop: 4 }}
    />
  );
  const box = screen.getByRole("checkbox", { name: "Remember this device" });
  expect(box.id).toBe("remember");
  expect(box.style.marginTop).toBe("4px");
  expect(screen.getByText("Remember me").parentElement?.className).toContain(
    "flex-none"
  );
  expect(
    screen.getByText("Remember me").parentElement?.className
  ).not.toContain("flex-1");
});

it("node-label links own their clicks while plain label text still toggles", () => {
  const change = vi.fn();
  const open = vi.fn();
  render(
    <Checkbox
      checked={false}
      accessibilityLabel="Accept the Terms"
      onCheckedChange={change}
      label={
        <>
          I agree to <Text onPress={open}>Terms</Text>
          <Text onClick={open}>Privacy</Text>
        </>
      }
    />
  );
  const box = screen.getByRole("checkbox", { name: "Accept the Terms" });
  fireEvent.click(screen.getByText("Terms"));
  fireEvent.click(screen.getByText("Privacy"));
  expect(open).toHaveBeenCalledTimes(2);
  expect(change).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText(/I agree to/u));
  expect(change).toHaveBeenCalledExactlyOnceWith(true);
  expect(box.getAttribute("aria-checked")).toBe("false");
});

it("never serializes a node label into an accessible name", () => {
  render(<Checkbox checked={false} label={<Text>Terms</Text>} />);
  expect(screen.getByRole("checkbox").hasAttribute("aria-label")).toBe(false);
});

it("adapts hitSlop through the shared pressable without moving the row", () => {
  const click = vi.fn();
  const change = vi.fn();
  render(
    <Checkbox
      checked={false}
      label="Option"
      hitSlop={{ left: 8, right: 12 }}
      onClick={click}
      onCheckedChange={change}
    />
  );
  const box = screen.getByRole("checkbox");
  const hitArea = box.querySelector<HTMLElement>('[aria-hidden="true"]');
  expect(hitArea?.dataset.taroStyle).toContain('"left":"-16rpx"');
  expect(hitArea?.dataset.taroStyle).toContain('"right":"-24rpx"');
  if (!hitArea) {
    throw new Error("Checkbox hit area is missing");
  }
  fireEvent.click(hitArea);
  expect(click).toHaveBeenCalledTimes(1);
  expect(change).toHaveBeenCalledExactlyOnceWith(true);
});

it("preserves disabled host touch sequences while suppressing clicks and changes", () => {
  const start = vi.fn();
  const end = vi.fn();
  const cancel = vi.fn();
  const click = vi.fn();
  const change = vi.fn();
  render(
    <Checkbox
      checked
      disabled
      label="Disabled"
      onTouchStart={start}
      onTouchEnd={end}
      onTouchCancel={cancel}
      onClick={click}
      onCheckedChange={change}
    />
  );
  const box = screen.getByRole("checkbox");
  fireEvent.touchStart(box);
  fireEvent.touchEnd(box);
  fireEvent.touchStart(box);
  fireEvent.touchCancel(box);
  fireEvent.click(box);
  expect(start).toHaveBeenCalledTimes(2);
  expect(end).toHaveBeenCalledTimes(1);
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(click).not.toHaveBeenCalled();
  expect(change).not.toHaveBeenCalled();
});
