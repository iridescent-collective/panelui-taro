// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Direction } from "../src/components/Direction";
import { Marquee } from "../src/components/Marquee";
import {
  marqueeCopyCount,
  normalizeMarqueeSpeed,
} from "../src/components/Marquee/marquee-math";
import { Text } from "../src/components/primitives/Text";
import { PanelUIProvider } from "../src/components/Provider";
import { readTaroStyle } from "./taro-style";

const trackStyle = (container: HTMLElement) =>
  readTaroStyle(
    container.querySelector(".panelui-marquee-track") as HTMLElement
  );
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
it("source copy budget expands spacing instead of mounting an unbounded tiny subtree", () => {
  expect(marqueeCopyCount(300, 1, 0)).toEqual({ count: 32, period: 10 });
  expect(marqueeCopyCount(100, 40, 10)).toEqual({ count: 4, period: 50 });
  expect(marqueeCopyCount(Number.NaN, 40, 0).count).toBe(0);
  expect(marqueeCopyCount(100, 0, 50)).toEqual({ count: 0, period: 0 });
  expect(normalizeMarqueeSpeed(Number.POSITIVE_INFINITY)).toBe(40);
  expect(normalizeMarqueeSpeed(-1)).toBe(0);
});
it("measured copies announce once and pause resumes from its exact offset", async () => {
  vi.useFakeTimers();
  try {
    const changed = vi.fn();
    const layout = vi.fn();
    const tree = render(
      <PanelUIProvider>
        <Marquee speed={10} onPlayingChange={changed} onLayout={layout}>
          <Text>Ticker</Text>
        </Marquee>
      </PanelUIProvider>
    );
    await settle();
    expect(screen.getAllByText("Ticker")).toHaveLength(4);
    expect(
      screen
        .getAllByText("Ticker")
        .filter((node) => !node.closest('[aria-hidden="true"]'))
    ).toHaveLength(1);
    expect(layout).toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(400));
    expect(trackStyle(tree.container)).toContain("translateX(-8rpx)");
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(changed).toHaveBeenLastCalledWith(false);
    act(() => vi.advanceTimersByTime(400));
    expect(trackStyle(tree.container)).toContain("translateX(-8rpx)");
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    act(() => vi.advanceTimersByTime(400));
    expect(trackStyle(tree.container)).toContain("translateX(-16rpx)");
    tree.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("RTL and reverse affect horizontal travel while vertical keeps its axis", async () => {
  vi.useFakeTimers();
  try {
    const tree = render(
      <PanelUIProvider>
        <Direction dir="rtl">
          <Marquee speed={10}>
            <Text>Ticker</Text>
          </Marquee>
        </Direction>
      </PanelUIProvider>
    );
    await settle();
    act(() => vi.advanceTimersByTime(400));
    expect(trackStyle(tree.container)).toContain("translateX(8rpx)");
    tree.rerender(
      <PanelUIProvider>
        <Direction dir="rtl">
          <Marquee speed={10} reverse>
            <Text>Ticker</Text>
          </Marquee>
        </Direction>
      </PanelUIProvider>
    );
    act(() => vi.advanceTimersByTime(400));
    expect(trackStyle(tree.container)).toContain("translateX(-16rpx)");
    tree.rerender(
      <PanelUIProvider>
        <Direction dir="rtl">
          <Marquee speed={10} direction="vertical">
            <Text>Ticker</Text>
          </Marquee>
        </Direction>
      </PanelUIProvider>
    );
    await settle();
    act(() => vi.advanceTimersByTime(400));
    expect(trackStyle(tree.container)).toContain("translateY(-8rpx)");
  } finally {
    vi.useRealTimers();
  }
});
it("group has one control and playing=false pauses all rows without overriding row constraints", async () => {
  vi.useFakeTimers();
  try {
    const tree = render(
      <PanelUIProvider>
        <Marquee.Group>
          <Marquee speed={10}>
            <Text>A</Text>
          </Marquee>
          <Marquee speed={10} playing={false}>
            <Text>B</Text>
          </Marquee>
        </Marquee.Group>
      </PanelUIProvider>
    );
    await settle();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    act(() => vi.advanceTimersByTime(400));
    expect(trackStyle(tree.container)).toContain("translateX(0rpx)");
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    tree.rerender(
      <PanelUIProvider>
        <Marquee.Group playing={false}>
          <Marquee speed={10}>
            <Text>A</Text>
          </Marquee>
          <Marquee speed={10} playing={false}>
            <Text>B</Text>
          </Marquee>
        </Marquee.Group>
      </PanelUIProvider>
    );
    await settle();
    act(() => vi.advanceTimersByTime(400));
    expect(trackStyle(tree.container)).toContain("translateX(0rpx)");
    expect(screen.queryByRole("button")).toBeNull();
  } finally {
    vi.useRealTimers();
  }
});
it("reduced motion renders one static subtree and zero speed offers no misleading pause", async () => {
  const tree = render(
    <PanelUIProvider reducedMotion>
      <Marquee>
        <Text>Still</Text>
      </Marquee>
    </PanelUIProvider>
  );
  expect(screen.getAllByText("Still")).toHaveLength(1);
  expect(screen.queryByRole("button")).toBeNull();
  tree.rerender(
    <PanelUIProvider>
      <Marquee speed={0}>
        <Text>Still</Text>
      </Marquee>
    </PanelUIProvider>
  );
  await settle();
  expect(screen.queryByRole("button")).toBeNull();
});
it("static reduced motion preserves layout callbacks without duplicating the subtree", async () => {
  const layout = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Marquee id="static-marquee" onLayout={layout}>
        <Text>Still</Text>
      </Marquee>
    </PanelUIProvider>
  );
  await settle();
  expect(document.querySelector("#static-marquee")).toBeTruthy();
  expect(layout).toHaveBeenCalledWith({
    height: 20,
    left: 4,
    top: 8,
    width: 40,
  });
  expect(screen.getAllByText("Still")).toHaveLength(1);
});
