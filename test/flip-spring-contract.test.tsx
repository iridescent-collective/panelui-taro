// @vitest-environment happy-dom

import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { useSpringNumber } from "../src/hooks/use-spring-number";

it("a clamped flip spring never overshoots its destination face", () => {
  vi.useFakeTimers();
  try {
    const { result, unmount } = renderHook(() =>
      useSpringNumber(
        0,
        { damping: 1, mass: 1, overshootClamping: true, stiffness: 100 },
        false
      )
    );
    act(() => result.current.springTo(1));
    for (let frame = 0; frame < 64; frame += 1) {
      act(() => vi.advanceTimersByTime(32));
      expect(result.current.value).toBeLessThanOrEqual(1);
      expect(result.current.value).toBeGreaterThanOrEqual(0);
    }
    expect(result.current.value).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
