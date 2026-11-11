// @vitest-environment happy-dom

import { act, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { CircularText } from "../src/components/CircularText";
import {
  circularTextGlyphs,
  normalizeDuration,
  normalizeRadius,
  normalizeSpread,
} from "../src/components/CircularText/geometry";
import { PanelUIProvider } from "../src/components/Provider";
import { readTaroStyle } from "./taro-style";

const rotation = () =>
  readTaroStyle(screen.getByTestId("ring").firstElementChild as HTMLElement);
it("source geometry closes full rings and reaches both endpoints of partial arcs", () => {
  expect(
    circularTextGlyphs("ABCD", 360, 10).map((glyph) => glyph.angle)
  ).toEqual([10, 100, 190, 280]);
  expect(
    circularTextGlyphs("ABCD", 180, 10).map((glyph) => glyph.angle)
  ).toEqual([10, 70, 130, 190]);
  expect(circularTextGlyphs("🙂", 180, Number.NaN)).toEqual([
    { angle: 0, character: "🙂", index: 0 },
  ]);
  expect(circularTextGlyphs("", 180, 0)).toEqual([]);
  expect(normalizeRadius(-1)).toBe(0);
  expect(normalizeRadius(Number.NaN)).toBe(90);
  expect(normalizeDuration(Number.POSITIVE_INFINITY)).toBe(20_000);
  expect(normalizeDuration(-1)).toBe(0);
  expect(normalizeSpread(-400)).toBe(360);
});
it("whole phrase is announced once and doubled glyph boxes honor radius and text slots", () => {
  render(
    <PanelUIProvider reducedMotion>
      <CircularText radius={30} textClassName="font-bold" data-testid="ring">
        AB
      </CircularText>
    </PanelUIProvider>
  );
  expect(screen.getByTestId("ring").getAttribute("aria-label")).toBe("AB");
  expect(readTaroStyle(screen.getByTestId("ring"))).toContain(
    '"width":"120rpx"'
  );
  expect(
    screen.getByTestId("ring").firstElementChild?.getAttribute("aria-hidden")
  ).toBe("true");
  expect(readTaroStyle(screen.getByText("B").parentElement)).toContain(
    "rotate(180deg)"
  );
  expect(screen.getByText("A").className).toContain("font-bold");
});
it("pause and resume hold current angle, reverse starts from it and unmount clears timers", () => {
  vi.useFakeTimers();
  try {
    const tree = render(
      <PanelUIProvider>
        <CircularText spinDuration={1600} data-testid="ring">
          ABC
        </CircularText>
      </PanelUIProvider>
    );
    act(() => vi.advanceTimersByTime(400));
    expect(rotation()).toContain("rotate(90deg)");
    tree.rerender(
      <PanelUIProvider>
        <CircularText spinDuration={1600} paused data-testid="ring">
          ABC
        </CircularText>
      </PanelUIProvider>
    );
    act(() => vi.advanceTimersByTime(400));
    expect(rotation()).toContain("rotate(90deg)");
    tree.rerender(
      <PanelUIProvider>
        <CircularText spinDuration={1600} reverse data-testid="ring">
          ABC
        </CircularText>
      </PanelUIProvider>
    );
    act(() => vi.advanceTimersByTime(400));
    expect(rotation()).toContain("rotate(0deg)");
    tree.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("zero duration, empty strings and reduced motion keep the ring still", () => {
  vi.useFakeTimers();
  try {
    const tree = render(
      <PanelUIProvider>
        <CircularText spinDuration={0}>A</CircularText>
      </PanelUIProvider>
    );
    expect(vi.getTimerCount()).toBe(0);
    tree.rerender(
      <PanelUIProvider>
        <CircularText>{""}</CircularText>
      </PanelUIProvider>
    );
    expect(vi.getTimerCount()).toBe(0);
    tree.rerender(
      <PanelUIProvider reducedMotion>
        <CircularText>A</CircularText>
      </PanelUIProvider>
    );
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
