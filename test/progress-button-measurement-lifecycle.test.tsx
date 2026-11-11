// @vitest-environment happy-dom

import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { useHoldGesture } from "../src/components/ProgressButton/use-gesture";
import { useHold } from "../src/components/ProgressButton/use-hold";
import type { useElementLayout } from "../src/hooks/use-element-layout";

type Measure = ReturnType<typeof useElementLayout>["refresh"];
const RECT = { height: 44, left: 0, top: 20, width: 100 };
const POINT = { clientX: 50, clientY: 40, identifier: 1 };

it.each(["release", "cancel", "disable", "unmount"] as const)(
  "a delayed measurement cannot restart the hold after %s",
  (lifecycle) => {
    vi.useFakeTimers();
    try {
      const complete = vi.fn();
      const measure = vi.fn<Measure>();
      const begin = vi.fn<() => boolean>();
      const hook = renderHook(
        ({ disabled }) => {
          const hold = useHold(
            { disabled, holdDuration: 200, onComplete: complete },
            false,
            true
          );
          begin.mockImplementation(hold.begin);
          const gesture = useHoldGesture(
            { ...hold, begin },
            RECT,
            disabled,
            false,
            undefined,
            measure
          );
          return { gesture, hold };
        },
        { initialProps: { disabled: false } }
      );
      act(() => {
        hook.result.current.gesture.onTouchStart({ touches: [POINT] });
      });
      expect(measure).toHaveBeenCalledTimes(1);
      expect(begin).not.toHaveBeenCalled();
      const [[active, reply]] = measure.mock.calls;
      expect(active()).toBe(true);
      expect(reply).toBeTypeOf("function");
      if (lifecycle === "release") {
        act(() => {
          hook.result.current.gesture.onTouchEnd({ changedTouches: [POINT] });
        });
      } else if (lifecycle === "cancel") {
        act(() => hook.result.current.gesture.onTouchCancel());
      } else if (lifecycle === "disable") {
        hook.rerender({ disabled: true });
      } else {
        hook.unmount();
      }
      expect(active()).toBe(false);
      act(() => {
        reply?.(RECT);
        vi.advanceTimersByTime(1000);
      });
      expect(begin).not.toHaveBeenCalled();
      expect(complete).not.toHaveBeenCalled();
      expect(hook.result.current.hold.progress.value).toBe(0);
      expect(vi.getTimerCount()).toBe(0);
      if (lifecycle !== "unmount") {
        expect(hook.result.current.gesture.active).toBe(false);
        hook.unmount();
      }
    } finally {
      vi.useRealTimers();
    }
  }
);

it("an accepted delayed measurement starts the real clock and completes once", () => {
  vi.useFakeTimers();
  try {
    const complete = vi.fn();
    const measure = vi.fn<Measure>();
    const hook = renderHook(() => {
      const hold = useHold(
        { holdDuration: 200, onComplete: complete },
        false,
        true
      );
      const gesture = useHoldGesture(
        hold,
        RECT,
        false,
        false,
        undefined,
        measure
      );
      return { gesture, hold };
    });
    act(() => {
      hook.result.current.gesture.onTouchStart({ touches: [POINT] });
      vi.advanceTimersByTime(1000);
    });
    expect(complete).not.toHaveBeenCalled();
    expect(hook.result.current.hold.progress.value).toBe(0);
    const [[active, reply]] = measure.mock.calls;
    expect(active()).toBe(true);
    expect(reply).toBeTypeOf("function");
    act(() => reply?.(RECT));
    expect(hook.result.current.gesture.active).toBe(true);
    act(() => vi.advanceTimersByTime(200));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(hook.result.current.hold.progress.value).toBe(1);
    act(() => {
      hook.result.current.gesture.onTouchEnd({ changedTouches: [POINT] });
      reply?.(RECT);
      vi.advanceTimersByTime(1000);
    });
    expect(active()).toBe(false);
    expect(complete).toHaveBeenCalledTimes(1);
    hook.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
