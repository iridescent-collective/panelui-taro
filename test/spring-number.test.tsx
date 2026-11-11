// @vitest-environment happy-dom

import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { useSpringNumber } from "../src/hooks/use-spring-number";

const CONFIG = { damping: 22, mass: 0.6, stiffness: 240 };
it("retargets continuously, reaches the new target and releases scheduled frames on unmount", () => {
  vi.useFakeTimers();
  try {
    const { result, rerender, unmount } = renderHook(
      ({ target }) => useSpringNumber(target, CONFIG, false),
      { initialProps: { target: 0 } }
    );
    rerender({ target: 10 });
    act(() => vi.advanceTimersByTime(64));
    const before = result.current.read();
    expect(before).toBeGreaterThan(0);
    expect(before).toBeLessThan(10);
    act(() => result.current.springTo(-10));
    expect(result.current.read()).toBe(before);
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.read()).toBe(-10);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("immediate gesture values cancel existing motion and still mode snaps without a frame", () => {
  vi.useFakeTimers();
  try {
    const { result, rerender } = renderHook(
      ({ target, still }) => useSpringNumber(target, CONFIG, still),
      { initialProps: { still: false, target: 0 } }
    );
    rerender({ still: false, target: 10 });
    act(() => result.current.setImmediate(4));
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.read()).toBe(4);
    rerender({ still: true, target: 8 });
    expect(result.current.read()).toBe(8);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("completion reports cancellation separately from settling and publishes actual motion values", () => {
  vi.useFakeTimers();
  try {
    const publish = vi.fn();
    const first = vi.fn();
    const second = vi.fn();
    const { result, unmount } = renderHook(() =>
      useSpringNumber(0, CONFIG, false, publish)
    );
    act(() => result.current.springTo(10, undefined, first));
    act(() => vi.advanceTimersByTime(160));
    expect(first).not.toHaveBeenCalledWith(true);
    expect(publish).toHaveBeenLastCalledWith(result.current.read());
    act(() => result.current.springTo(-10, undefined, second));
    expect(first).toHaveBeenCalledExactlyOnceWith(false);
    act(() => vi.advanceTimersByTime(2000));
    expect(second).toHaveBeenCalledExactlyOnceWith(true);
    expect(publish).toHaveBeenLastCalledWith(-10);
    const cancelled = vi.fn();
    act(() => result.current.springTo(20, undefined, cancelled));
    unmount();
    expect(cancelled).toHaveBeenCalledExactlyOnceWith(false);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("manual motion does not reset to the constructor value when reduced motion changes", () => {
  const { result, rerender } = renderHook(
    ({ still }) => useSpringNumber(0, CONFIG, still, undefined, false),
    { initialProps: { still: false } }
  );
  act(() => result.current.setImmediate(7));
  rerender({ still: true });
  expect(result.current.read()).toBe(7);
});
