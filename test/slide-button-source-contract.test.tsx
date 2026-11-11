// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Direction } from "../src/components/Direction";
import { PanelUIProvider } from "../src/components/Provider";
import { SlideButton } from "../src/components/SlideButton";
import {
  clamp,
  isCommitted,
  offsetFor,
  progressFor,
  resolveThreshold,
} from "../src/components/SlideButton/slide-button-track";
import { useSlideState } from "../src/components/SlideButton/use-state";
import { useMotionNumber } from "../src/hooks/use-motion-number";
import { setElementMeasurement, vibrateShort } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
const touches = (x: number, y = 25, identifier = 1) => [
  { clientX: x, clientY: y, identifier },
];
it("source track clamps thresholds, measures against thumb travel and projects 0.12 seconds of velocity", () => {
  const defaults: {
    threshold?: number;
  } = {};
  expect(resolveThreshold(defaults.threshold)).toBe(0.9);
  expect(resolveThreshold(Number.NaN)).toBe(0.9);
  expect(resolveThreshold(0)).toBe(0.1);
  expect(resolveThreshold(2)).toBe(1);
  expect(progressFor(100, 200)).toBe(0.5);
  expect(progressFor(260, 200)).toBe(1);
  expect(progressFor(50, 0)).toBe(0);
  expect(offsetFor(280, 200)).toBe(210);
  expect(offsetFor(-80, 200)).toBe(-10);
  expect(isCommitted(0.55, 700, 200, 0.9)).toBe(true);
  expect(isCommitted(0.55, -700, 200, 0.9)).toBe(false);
  expect(isCommitted(1, 9000, 0, 0.9)).toBe(false);
  expect(clamp(-1, 0, 1)).toBe(0);
});
it("measured geometry keeps the label fixed, rests with zero fill and supplies exactly one default thumb", async () => {
  setElementMeasurement("slide", { height: 52, left: 0, top: 0, width: 300 });
  render(
    <PanelUIProvider reducedMotion>
      <SlideButton id="slide">
        <SlideButton.Label>Slide to ship</SlideButton.Label>
      </SlideButton>
    </PanelUIProvider>
  );
  await settle();
  const root = screen.getByRole("button", { name: "Confirm" });
  const fill = root.querySelector('[aria-hidden="true"]');
  expect(readTaroStyle(fill)).toContain('"width":"0rpx"');
  const thumb = root.querySelector('[data-taro-style*="148rpx"]');
  expect(thumb).not.toBeNull();
  expect(
    readTaroStyle(screen.getByText("Slide to ship").parentElement)
  ).not.toContain("opacity");
  expect(root.querySelectorAll(".panelui-slide-surface")).toHaveLength(1);
});
it("a tap never confirms, a near-end release completes once without recomputing release coordinates", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("slide", { height: 52, left: 0, top: 0, width: 300 });
    const complete = vi.fn();
    render(
      <PanelUIProvider reducedMotion>
        <SlideButton id="slide" onComplete={complete}>
          Slide
        </SlideButton>
      </PanelUIProvider>
    );
    await settle();
    const surface = document.querySelector(".panelui-slide-surface");
    if (!surface) {
      throw new Error("Missing slide touch surface");
    }
    fireEvent.touchStart(surface, { touches: touches(40) });
    fireEvent.touchEnd(surface, { changedTouches: touches(40) });
    await settle();
    expect(complete).not.toHaveBeenCalled();
    fireEvent.touchStart(surface, { touches: touches(40) });
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.touchMove(surface, { touches: touches(240) });
    act(() => vi.advanceTimersByTime(101));
    fireEvent.touchEnd(surface, { changedTouches: touches(0) });
    expect(complete).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(160));
    expect(screen.getByRole("button").getAttribute("aria-checked")).toBe(
      "true"
    );
    fireEvent.touchStart(surface, { touches: touches(40) });
    fireEvent.touchMove(surface, { touches: touches(270) });
    fireEvent.touchEnd(surface, { changedTouches: touches(270) });
    expect(complete).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
  }
});
it("RTL slides and projection reverse together while a stationary short release springs home", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("rtl-slide", {
      height: 52,
      left: 0,
      top: 0,
      width: 300,
    });
    const complete = vi.fn();
    render(
      <PanelUIProvider reducedMotion>
        <Direction dir="rtl">
          <SlideButton id="rtl-slide" onComplete={complete}>
            Slide
          </SlideButton>
        </Direction>
      </PanelUIProvider>
    );
    await settle();
    const surface = document.querySelector(".panelui-slide-surface");
    if (!surface) {
      throw new Error("Missing RTL slide");
    }
    fireEvent.touchStart(surface, { touches: touches(250) });
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.touchMove(surface, { touches: touches(200) });
    act(() => vi.advanceTimersByTime(101));
    fireEvent.touchEnd(surface, { changedTouches: touches(200) });
    expect(complete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(160));
    await settle();
    fireEvent.touchStart(surface, { touches: touches(250) });
    act(() => vi.advanceTimersByTime(100));
    fireEvent.touchMove(surface, { touches: touches(110) });
    fireEvent.touchEnd(surface, { changedTouches: touches(110) });
    expect(complete).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
  }
});
it("vertical intent, multi-touch and disabling a live drag cancel without a confirmation", async () => {
  setElementMeasurement("cancel-slide", {
    height: 52,
    left: 0,
    top: 0,
    width: 300,
  });
  const complete = vi.fn();
  const draw = (disabled: boolean) => (
    <PanelUIProvider reducedMotion>
      <SlideButton
        id="cancel-slide"
        disabled={disabled}
        onComplete={complete}
      />
    </PanelUIProvider>
  );
  const view = render(draw(false));
  await settle();
  const surface = document.querySelector(".panelui-slide-surface");
  if (!surface) {
    throw new Error("Missing cancel slide");
  }
  fireEvent.touchStart(surface, { touches: touches(40) });
  fireEvent.touchMove(surface, { touches: touches(40, 50) });
  fireEvent.touchEnd(surface, { changedTouches: touches(40, 50) });
  fireEvent.touchStart(surface, { touches: touches(40) });
  fireEvent.touchMove(surface, {
    touches: [...touches(250), ...touches(260, 25, 2)],
  });
  fireEvent.touchEnd(surface, { changedTouches: touches(250) });
  fireEvent.touchStart(surface, { touches: touches(40) });
  fireEvent.touchMove(surface, { touches: touches(100) });
  view.rerender(draw(true));
  fireEvent.touchEnd(surface, { changedTouches: touches(250) });
  expect(complete).not.toHaveBeenCalled();
});
it("external completion fills without executing actions and controlled refusal restores the accepted drawing", async () => {
  vi.useFakeTimers();
  try {
    const complete = vi.fn();
    const view = renderHook(
      ({ completed }) =>
        useSlideState({ completed, onComplete: complete }, true),
      { initialProps: { completed: true } }
    );
    act(() => vi.advanceTimersByTime(160));
    expect(view.result.current.progress.value).toBe(1);
    expect(complete).not.toHaveBeenCalled();
    view.rerender({ completed: false });
    act(() => vi.advanceTimersByTime(160));
    act(() => {
      view.result.current.begin();
      view.result.current.move(0.95);
      view.result.current.release(true, 0);
    });
    await settle();
    act(() => vi.advanceTimersByTime(160));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(view.result.current.progress.value).toBe(0);
    expect(view.result.current.completed).toBe(false);
  } finally {
    vi.useRealTimers();
  }
});
it("auto reset requests false once and a refusing controlled owner retains completion", () => {
  vi.useFakeTimers();
  try {
    const changed = vi.fn();
    const view = renderHook(() =>
      useSlideState(
        { autoReset: true, completed: true, onCompletedChange: changed },
        true
      )
    );
    act(() => vi.advanceTimersByTime(1000));
    expect(changed).toHaveBeenCalledExactlyOnceWith(false);
    expect(view.result.current.completed).toBe(true);
    expect(view.result.current.progress.value).toBe(1);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("arming only ticks on crossings and committing knocks once, then all clocks clean up", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("haptic-slide", {
      height: 52,
      left: 0,
      top: 0,
      width: 300,
    });
    const view = render(
      <PanelUIProvider reducedMotion>
        <SlideButton id="haptic-slide" haptics />
      </PanelUIProvider>
    );
    await settle();
    const surface = document.querySelector(".panelui-slide-surface");
    if (!surface) {
      throw new Error("Missing haptic slide");
    }
    fireEvent.touchStart(surface, { touches: touches(40) });
    fireEvent.touchMove(surface, { touches: touches(240) });
    fireEvent.touchMove(surface, { touches: touches(245) });
    act(() => vi.advanceTimersByTime(1));
    expect(vibrateShort.mock.calls).toEqual([[{ type: "light" }]]);
    fireEvent.touchEnd(surface, { changedTouches: touches(245) });
    act(() => vi.advanceTimersByTime(1));
    expect(vibrateShort.mock.calls).toEqual([
      [{ type: "light" }],
      [{ type: "medium" }],
    ]);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("observable progress writes update the motion owner and a timed snap can be interrupted from its current frame", () => {
  vi.useFakeTimers();
  try {
    const view = renderHook(() =>
      useMotionNumber(0, {
        damping: 22,
        mass: 0.7,
        overshootClamping: true,
        stiffness: 220,
      })
    );
    act(() => {
      view.result.current.signal.value = 0.5;
    });
    expect(view.result.current.read()).toBe(0.5);
    act(() => view.result.current.timingTo(1, 160));
    act(() => vi.advanceTimersByTime(80));
    expect(view.result.current.signal.value).toBe(0.75);
    act(() => view.result.current.timingTo(0, 160));
    expect(view.result.current.signal.value).toBe(0.75);
    act(() => vi.advanceTimersByTime(160));
    expect(view.result.current.signal.value).toBe(0);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("a timing observer changing progress cancels the old trajectory instead of being overwritten by later frames", () => {
  vi.useFakeTimers();
  try {
    const view = renderHook(() =>
      useMotionNumber(0, { damping: 22, mass: 0.7, stiffness: 220 })
    );
    let cancelled = false;
    const unsubscribe = view.result.current.signal.subscribe(() => {
      if (!cancelled && view.result.current.signal.value > 0) {
        cancelled = true;
        view.result.current.signal.value = 0;
      }
    });
    act(() => view.result.current.timingTo(1, 160));
    act(() => vi.advanceTimersByTime(200));
    expect(view.result.current.read()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
    unsubscribe();
    view.unmount();
  } finally {
    vi.useRealTimers();
  }
});
