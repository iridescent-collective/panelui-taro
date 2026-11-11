// @vitest-environment happy-dom

import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { useCropMotion } from "../src/components/AvatarCropper/use-motion";

it("matches the 260ms source turn and stops at the live angle when interrupted", () => {
  vi.useFakeTimers();
  try {
    const { result } = renderHook(useCropMotion);
    act(() =>
      result.current.write({ rotation: 90, scale: 1, x: 0, y: 0 }, "timing")
    );
    act(() => vi.advanceTimersByTime(130));
    const middle = result.current.read().rotation;
    expect(middle).toBeGreaterThan(30);
    expect(middle).toBeLessThan(60);
    act(() => result.current.stop());
    act(() => vi.advanceTimersByTime(300));
    expect(result.current.read().rotation).toBe(middle);
    act(() =>
      result.current.write({ rotation: 90, scale: 1, x: 0, y: 0 }, "timing")
    );
    act(() => vi.advanceTimersByTime(260));
    expect(result.current.read().rotation).toBe(90);
  } finally {
    vi.useRealTimers();
  }
});
it("uses the source spring for gesture settling and cancels all motion on unmount", () => {
  vi.useFakeTimers();
  try {
    const { result, unmount } = renderHook(useCropMotion);
    act(() =>
      result.current.write({ rotation: 0, scale: 2, x: 80, y: -20 }, "spring")
    );
    act(() => vi.advanceTimersByTime(64));
    expect(result.current.read().x).toBeGreaterThan(0);
    expect(result.current.read().x).toBeLessThan(80);
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.read().x).toBeCloseTo(80, 2);
    act(() =>
      result.current.write({ rotation: 90, scale: 1, x: 0, y: 0 }, "timing")
    );
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
