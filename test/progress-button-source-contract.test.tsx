// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import {
  ProgressButton,
  fillDuration,
  releaseDuration,
  resolveHoldDuration,
  isComplete,
} from "../src/components/ProgressButton";
import { useDone } from "../src/components/ProgressButton/use-done";
import { useHold, holdFrame } from "../src/components/ProgressButton/use-hold";
import { PanelUIProvider } from "../src/components/Provider";
import { setElementMeasurement, vibrateShort } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const touches = (x = 50, y = 40) => [{ clientX: x, clientY: y, identifier: 1 }];
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
it("source hold arithmetic floors durations, rejects nonfinite input and has no completion tolerance", () => {
  const defaults: {
    holdDuration?: number;
  } = {};
  expect(resolveHoldDuration(defaults.holdDuration)).toBe(2000);
  expect(resolveHoldDuration(Number.NaN)).toBe(2000);
  expect(resolveHoldDuration(0)).toBe(200);
  expect(fillDuration(0.6, 2000)).toBe(800);
  expect(fillDuration(0.99, 2000)).toBe(80);
  expect(releaseDuration(0.6, 2000)).toBe(1200);
  expect(releaseDuration(0.001, 2000)).toBe(80);
  expect(isComplete(0.99999)).toBe(false);
});
it("reduced motion remains below full until the entire declared hold has elapsed", () => {
  vi.useFakeTimers();
  try {
    const complete = vi.fn();
    const view = renderHook(() =>
      useHold({ holdDuration: 2000, onComplete: complete }, true, true)
    );
    act(() => view.result.current.begin());
    act(() => vi.advanceTimersByTime(1616));
    expect(view.result.current.progress.value).toBe(0.8);
    expect(complete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(384));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(view.result.current.completed).toBe(true);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("a released hold rewinds from its last displayed frame and cannot finish later", () => {
  vi.useFakeTimers();
  try {
    const complete = vi.fn();
    const view = renderHook(() =>
      useHold({ holdDuration: 2000, onComplete: complete }, false, true)
    );
    act(() => view.result.current.begin());
    act(() => vi.advanceTimersByTime(1008));
    expect(view.result.current.progress.value).toBeCloseTo(0.504);
    act(() => view.result.current.abandon());
    expect(view.result.current.progress.value).toBeCloseTo(0.504);
    act(() => vi.advanceTimersByTime(1008));
    expect(view.result.current.progress.value).toBe(0);
    expect(complete).not.toHaveBeenCalled();
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("catching a draining fill resumes from the displayed progress at the original rate", () => {
  vi.useFakeTimers();
  try {
    const complete = vi.fn();
    const view = renderHook(() =>
      useHold({ holdDuration: 2000, onComplete: complete }, false, true)
    );
    act(() => view.result.current.begin());
    act(() => vi.advanceTimersByTime(1008));
    act(() => view.result.current.abandon());
    act(() => vi.advanceTimersByTime(400));
    expect(view.result.current.progress.value).toBeCloseTo(0.304);
    act(() => view.result.current.begin());
    act(() => vi.advanceTimersByTime(1392));
    expect(complete).toHaveBeenCalledTimes(1);
    act(() => view.result.current.abandon());
    expect(view.result.current.progress.value).toBe(1);
    view.unmount();
  } finally {
    vi.useRealTimers();
  }
});
it("external completion draws the filled state without running the action", () => {
  vi.useFakeTimers();
  try {
    const complete = vi.fn();
    const view = renderHook(() =>
      useHold({ completed: true, onComplete: complete }, false, true)
    );
    expect(view.result.current.progress.value).toBe(1);
    act(() => view.result.current.begin());
    expect(complete).not.toHaveBeenCalled();
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("a controlled completion rejection leaves action delivery single and release returns the fill", () => {
  vi.useFakeTimers();
  try {
    const complete = vi.fn();
    const change = vi.fn();
    const view = renderHook(() =>
      useHold(
        {
          completed: false,
          holdDuration: 200,
          onComplete: complete,
          onCompletedChange: change,
        },
        false,
        true
      )
    );
    act(() => view.result.current.begin());
    act(() => vi.advanceTimersByTime(200));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledExactlyOnceWith(true);
    expect(view.result.current.completed).toBe(false);
    act(() => view.result.current.begin());
    act(() => vi.advanceTimersByTime(100));
    expect(complete).toHaveBeenCalledTimes(1);
    act(() => view.result.current.abandon());
    act(() => vi.advanceTimersByTime(200));
    expect(view.result.current.progress.value).toBe(0);
    view.unmount();
  } finally {
    vi.useRealTimers();
  }
});
it("auto reset follows the source delay and drains the accepted completed fill", () => {
  vi.useFakeTimers();
  try {
    const change = vi.fn();
    const view = renderHook(() =>
      useHold(
        {
          autoReset: true,
          autoResetDelay: 100,
          holdDuration: 200,
          onCompletedChange: change,
        },
        false,
        true
      )
    );
    act(() => view.result.current.begin());
    act(() => vi.advanceTimersByTime(200));
    expect(view.result.current.completed).toBe(true);
    act(() => vi.advanceTimersByTime(100));
    expect(view.result.current.completed).toBe(false);
    expect(change.mock.calls).toEqual([[true], [false]]);
    act(() => vi.advanceTimersByTime(200));
    expect(view.result.current.progress.value).toBe(0);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("a refused controlled reset preserves the accepted completed fill", () => {
  vi.useFakeTimers();
  try {
    const change = vi.fn();
    const view = renderHook(() =>
      useHold(
        {
          autoReset: true,
          autoResetDelay: 100,
          completed: true,
          holdDuration: 200,
          onCompletedChange: change,
        },
        false,
        true
      )
    );
    act(() => vi.advanceTimersByTime(300));
    expect(change).toHaveBeenCalledExactlyOnceWith(false);
    expect(view.result.current.completed).toBe(true);
    expect(view.result.current.progress.value).toBe(1);
    view.unmount();
  } finally {
    vi.useRealTimers();
  }
});
it("callback identity updates do not postpone auto reset and the newest callback receives it", () => {
  vi.useFakeTimers();
  try {
    const first = vi.fn();
    const second = vi.fn();
    const view = renderHook(
      ({ change }) =>
        useHold(
          {
            autoReset: true,
            autoResetDelay: 100,
            completed: true,
            onCompletedChange: change,
          },
          false,
          true
        ),
      { initialProps: { change: first } }
    );
    act(() => vi.advanceTimersByTime(50));
    view.rerender({ change: second });
    act(() => vi.advanceTimersByTime(50));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledExactlyOnceWith(false);
    view.unmount();
  } finally {
    vi.useRealTimers();
  }
});
it("completion mark springs in and uses the source 140ms timing to leave", () => {
  vi.useFakeTimers();
  try {
    const view = renderHook(({ completed }) => useDone(completed, false), {
      initialProps: { completed: false },
    });
    view.rerender({ completed: true });
    act(() => vi.advanceTimersByTime(500));
    expect(view.result.current.value).toBeGreaterThan(0.9);
    view.rerender({ completed: false });
    act(() => vi.advanceTimersByTime(144));
    expect(view.result.current.value).toBe(0);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("tap and early touch release do not confirm while labels stay pinned under the clipping window", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("hold-button", {
      height: 44,
      left: 0,
      top: 20,
      width: 100,
    });
    const complete = vi.fn();
    render(
      <PanelUIProvider>
        <ProgressButton id="hold-button" onComplete={complete}>
          <ProgressButton.Label>Hold</ProgressButton.Label>
        </ProgressButton>
      </PanelUIProvider>
    );
    await settle();
    const button = screen.getByRole("button", { name: "Hold" });
    fireEvent.click(button);
    expect(complete).not.toHaveBeenCalled();
    fireEvent.touchStart(button, { touches: touches() });
    await settle();
    act(() => vi.advanceTimersByTime(1008));
    const clip = button.querySelector('[aria-hidden="true"]');
    expect(readTaroStyle(clip)).toContain('"width":"100.8rpx"');
    expect(readTaroStyle(clip?.firstElementChild)).toContain(
      '"width":"200rpx"'
    );
    fireEvent.touchEnd(button, { changedTouches: touches() });
    act(() => vi.advanceTimersByTime(3000));
    expect(complete).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});
it("movement outside the 16dp retention boundary and disabled changes abort a live hold", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("hold-button", {
      height: 44,
      left: 0,
      top: 20,
      width: 100,
    });
    const complete = vi.fn();
    const draw = (disabled: boolean) => (
      <PanelUIProvider reducedMotion>
        <ProgressButton
          id="hold-button"
          disabled={disabled}
          holdDuration={200}
          onComplete={complete}
        />
      </PanelUIProvider>
    );
    const view = render(draw(false));
    await settle();
    const button = screen.getByRole("button");
    fireEvent.touchStart(button, { touches: touches() });
    await settle();
    act(() => vi.advanceTimersByTime(96));
    fireEvent.touchMove(button, { touches: touches(130, 40) });
    act(() => vi.advanceTimersByTime(500));
    expect(complete).not.toHaveBeenCalled();
    fireEvent.touchEnd(button, { changedTouches: touches(130, 40) });
    fireEvent.touchStart(button, { touches: touches() });
    await settle();
    view.rerender(draw(true));
    act(() => vi.advanceTimersByTime(500));
    expect(complete).not.toHaveBeenCalled();
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("unmeasured or disabled buttons never begin a confirmation clock", () => {
  vi.useFakeTimers();
  try {
    const view = renderHook(() => useHold({ disabled: true }, false, true));
    expect(view.result.current.begin()).toBe(false);
    view.unmount();
    const unmeasured = renderHook(() => useHold({}, false, false));
    expect(unmeasured.result.current.begin()).toBe(false);
    unmeasured.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("haptics use a light start and medium completion and pending callbacks are cleaned up", () => {
  vi.useFakeTimers();
  try {
    const view = renderHook(() =>
      useHold({ haptics: true, holdDuration: 200 }, false, true)
    );
    act(() => view.result.current.begin());
    act(() => vi.advanceTimersByTime(200));
    act(() => vi.advanceTimersByTime(1));
    expect(vibrateShort.mock.calls).toEqual([
      [{ type: "light" }],
      [{ type: "medium" }],
    ]);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(holdFrame(0, 1, 199, 200, true)).toBe(0.8);
  } finally {
    vi.useRealTimers();
  }
});
it("hitSlop keeps an unclipped absolute hit region and retains holds within its extended boundary", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("hold-hit", {
      height: 44,
      left: 0,
      top: 20,
      width: 100,
    });
    const complete = vi.fn();
    render(
      <PanelUIProvider reducedMotion>
        <ProgressButton
          id="hold-hit"
          hitSlop={{ left: 20, top: 8 }}
          holdDuration={200}
          onComplete={complete}
        />
      </PanelUIProvider>
    );
    await settle();
    const button = screen.getByRole("button");
    const hit = button.querySelector('[data-panel-hold-hit="true"]');
    expect(hit).not.toBeNull();
    expect(readTaroStyle(button)).toContain('"overflow":"visible"');
    expect(readTaroStyle(hit)).toContain('"left":"-40rpx"');
    expect(readTaroStyle(hit)).toContain('"top":"-16rpx"');
    expect(readTaroStyle(hit)).toContain('"position":"absolute"');
    expect(
      readTaroStyle(button.querySelector('[data-panel-hold-visual="true"]'))
    ).toContain('"overflow":"hidden"');
    if (!hit) {
      throw new Error("Missing expanded hold hit region");
    }
    fireEvent.touchStart(hit, { touches: touches(-10, 40) });
    await settle();
    act(() => vi.advanceTimersByTime(96));
    fireEvent.touchMove(button, { touches: touches(-30, 40) });
    act(() => vi.advanceTimersByTime(104));
    expect(complete).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
  }
});
it("numeric hitSlop retains each edge but cancels beyond the expanded hit plus retention boundary", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("hold-hit-number", {
      height: 44,
      left: 0,
      top: 20,
      width: 100,
    });
    const complete = vi.fn();
    render(
      <PanelUIProvider reducedMotion>
        <ProgressButton
          id="hold-hit-number"
          hitSlop={20}
          holdDuration={200}
          onComplete={complete}
        />
      </PanelUIProvider>
    );
    await settle();
    const button = screen.getByRole("button");
    const hit = button.querySelector('[data-panel-hold-hit="true"]');
    expect(hit).not.toBeNull();
    expect(readTaroStyle(hit)).toContain('"right":"-40rpx"');
    if (!hit) {
      throw new Error("Missing expanded hold hit region");
    }
    fireEvent.touchStart(hit, { touches: touches(110, 40) });
    await settle();
    act(() => vi.advanceTimersByTime(96));
    fireEvent.touchMove(button, { touches: touches(137, 40) });
    act(() => vi.advanceTimersByTime(300));
    expect(complete).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});

it("retains a hold inside its current bounds after a parent scroll", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("hold-scroll", {
      height: 44,
      left: 0,
      top: 300,
      width: 100,
    });
    const complete = vi.fn();
    render(
      <PanelUIProvider reducedMotion>
        <ProgressButton
          id="hold-scroll"
          holdDuration={200}
          onComplete={complete}
        />
      </PanelUIProvider>
    );
    await settle();
    setElementMeasurement("hold-scroll", {
      height: 44,
      left: 0,
      top: 100,
      width: 100,
    });
    const button = screen.getByRole("button");
    fireEvent.touchStart(button, { touches: touches(50, 120) });
    await settle();
    fireEvent.touchMove(button, { touches: touches(51, 121) });
    await settle();
    act(() => vi.advanceTimersByTime(200));
    expect(complete).toHaveBeenCalledTimes(1);
    fireEvent.touchEnd(button, { changedTouches: touches(51, 121) });
  } finally {
    vi.useRealTimers();
  }
});
