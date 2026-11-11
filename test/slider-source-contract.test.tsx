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
import { Slider } from "../src/components/Slider";
import {
  pickSliderThumb,
  snapSlider,
  sliderPointFraction,
} from "../src/components/Slider/math";
import { useSliderState } from "../src/components/Slider/use-state";
import { setElementMeasurement, vibrateShort } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const touches = (x: number, y = 10, identifier = 1) => [
  { clientX: x, clientY: y, identifier },
];
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
it.each(["ltr", "rtl"] as const)(
  "%s tap commits the release position like the upstream tap gesture",
  async (direction) => {
    const commit = vi.fn();
    render(
      <PanelUIProvider reducedMotion>
        <Direction dir={direction}>
          <Slider onValueCommit={commit} trackClassName="release-track" />
        </Direction>
      </PanelUIProvider>
    );
    const track = document.querySelector(".release-track");
    if (!track) {
      throw new Error("Missing release track");
    }
    setElementMeasurement(track.id, {
      height: 20,
      left: 0,
      top: 0,
      width: 128,
    });
    await settle();
    fireEvent.touchStart(track, {
      touches: touches(direction === "ltr" ? 14 : 114),
    });
    fireEvent.touchEnd(track, {
      changedTouches: touches(direction === "ltr" ? 22 : 106),
    });
    await settle();
    expect(commit).toHaveBeenCalledExactlyOnceWith(8);
  }
);
it("a release beyond the tap distance without an intervening move cannot change the value", async () => {
  const commit = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Slider onValueCommit={commit} trackClassName="release-track" />
    </PanelUIProvider>
  );
  const track = document.querySelector(".release-track");
  if (!track) {
    throw new Error("Missing release track");
  }
  setElementMeasurement(track.id, { height: 20, left: 0, top: 0, width: 128 });
  await settle();
  fireEvent.touchStart(track, { touches: touches(64, 10) });
  fireEvent.touchEnd(track, { changedTouches: touches(64, 40) });
  expect(commit).not.toHaveBeenCalled();
});
it("source arithmetic snaps from min, clamps endpoints and disambiguates stacked thumb ties", () => {
  expect(snapSlider(19, 5, 90, 10)).toBe(15);
  expect(snapSlider(101, 0, 100, 30)).toBe(90);
  expect(snapSlider(12.5, 0, 100, 0)).toBe(12.5);
  expect(sliderPointFraction(14, 128, 28, 1)).toBe(0);
  expect(sliderPointFraction(114, 128, 28, -1)).toBe(0);
  expect(pickSliderThumb(0, 128, 28, 1, 0, 0)).toBe("low");
  expect(pickSliderThumb(128, 128, 28, 1, 1, 1)).toBe("high");
});
it("an uncontrolled drag reports snapped values and release settles the displayed thumb onto the accepted step", async () => {
  const changed = vi.fn();
  const committed = vi.fn();
  const view = renderHook(() =>
    useSliderState(
      {
        defaultValue: 20,
        onValueChange: changed,
        onValueCommit: committed,
        step: 20,
      },
      true
    )
  );
  act(() => {
    view.result.current.begin("high");
    view.result.current.move(0, 0.34, "high");
  });
  expect(changed).toHaveBeenLastCalledWith(40);
  expect(view.result.current.highProgress).toBe(0.34);
  act(() => view.result.current.finish("high"));
  await settle();
  expect(committed).toHaveBeenCalledExactlyOnceWith(40);
  expect(view.result.current.highProgress).toBe(0.4);
});
it("the controlled owner may refuse a drag while commits retain the picked value and visual returns", async () => {
  const committed = vi.fn();
  const view = renderHook(() =>
    useSliderState({ onValueCommit: committed, step: 10, value: 20 }, true)
  );
  act(() => {
    view.result.current.begin("high");
    view.result.current.move(0, 0.75, "high");
    view.result.current.finish("high");
  });
  await settle();
  expect(committed).toHaveBeenCalledExactlyOnceWith(80);
  expect(view.result.current.value).toBe(20);
  expect(view.result.current.highProgress).toBe(0.2);
});
it("range state orders supplied endpoints, formats labels and keeps separate callbacks", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <Slider
        defaultRange={[80, 20]}
        label="Price"
        showValue
        formatValue={(value) => `$${value}`}
      />
    </PanelUIProvider>
  );
  await settle();
  expect(screen.getByText("$20 – $80")).toBeTruthy();
  expect(
    screen
      .getByRole("slider", { name: "Price, minimum" })
      .getAttribute("aria-valuenow")
  ).toBe("20");
  expect(
    screen
      .getByRole("slider", { name: "Price, maximum" })
      .getAttribute("aria-valuenow")
  ).toBe("80");
});
it("track tap commits the nearest endpoint once and respects a two-step gap", async () => {
  const commit = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Slider
        defaultRange={[20, 80]}
        step={10}
        minStepsBetweenThumbs={2}
        onRangeCommit={commit}
        trackClassName="range-track"
      />
    </PanelUIProvider>
  );
  const track = document.querySelector(".range-track");
  if (!track) {
    throw new Error("Missing range track");
  }
  setElementMeasurement(track.id, { height: 20, left: 0, top: 0, width: 128 });
  await settle();
  fireEvent.touchStart(track, { touches: touches(110) });
  fireEvent.touchMove(track, { touches: touches(20) });
  fireEvent.touchEnd(track, { changedTouches: touches(0) });
  await settle();
  expect(commit).toHaveBeenCalledExactlyOnceWith([20, 40]);
});
it("a tap from the physical left maps to maximum in RTL and drag direction is mirrored", async () => {
  const commit = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Direction dir="rtl">
        <Slider
          defaultValue={50}
          onValueCommit={commit}
          trackClassName="rtl-track"
        />
      </Direction>
    </PanelUIProvider>
  );
  const track = document.querySelector(".rtl-track");
  if (!track) {
    throw new Error("Missing RTL track");
  }
  setElementMeasurement(track.id, { height: 20, left: 0, top: 0, width: 128 });
  await settle();
  fireEvent.touchStart(track, { touches: touches(14) });
  fireEvent.touchEnd(track, { changedTouches: touches(14) });
  await settle();
  expect(commit).toHaveBeenLastCalledWith(100);
  fireEvent.touchStart(track, { touches: touches(14) });
  fireEvent.touchMove(track, { touches: touches(64) });
  fireEvent.touchEnd(track, { changedTouches: touches(0) });
  await settle();
  expect(commit).toHaveBeenLastCalledWith(50);
});
it("multi-touch and a configuration change cancel without committing", async () => {
  const commit = vi.fn();
  const draw = (disabled: boolean) => (
    <PanelUIProvider reducedMotion>
      <Slider
        onValueCommit={commit}
        disabled={disabled}
        trackClassName="cancel-track"
      />
    </PanelUIProvider>
  );
  const view = render(draw(false));
  const track = document.querySelector(".cancel-track");
  if (!track) {
    throw new Error("Missing cancel track");
  }
  setElementMeasurement(track.id, { height: 20, left: 0, top: 0, width: 128 });
  await settle();
  fireEvent.touchStart(track, { touches: touches(14) });
  fireEvent.touchMove(track, {
    touches: [...touches(64), ...touches(70, 10, 2)],
  });
  fireEvent.touchEnd(track, { changedTouches: touches(64) });
  expect(commit).not.toHaveBeenCalled();
  fireEvent.touchStart(track, { touches: touches(14) });
  fireEvent.touchMove(track, { touches: touches(64) });
  view.rerender(draw(true));
  fireEvent.touchEnd(track, { changedTouches: touches(64) });
  expect(commit).not.toHaveBeenCalled();
});
it("step ticks are per thumb and only changed steps tick, with pending work cleared on unmount", () => {
  vi.useFakeTimers();
  try {
    const view = renderHook(() =>
      useSliderState({ defaultRange: [20, 80], haptics: true }, true)
    );
    act(() => {
      view.result.current.begin("low");
      view.result.current.move(0.3, 0.8, "low");
    });
    act(() => vi.advanceTimersByTime(1));
    expect(vibrateShort).toHaveBeenCalledTimes(1);
    act(() => view.result.current.move(0.3, 0.8, "low"));
    act(() => vi.advanceTimersByTime(1));
    expect(vibrateShort).toHaveBeenCalledTimes(1);
    act(() => view.result.current.move(0.3, 0.7, "high"));
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("native is ignored for a range and unsupported fractional native domains preserve the custom control", async () => {
  const view = render(
    <PanelUIProvider reducedMotion>
      <Slider native defaultRange={[20, 80]} />
    </PanelUIProvider>
  );
  await settle();
  expect(screen.getAllByRole("slider")).toHaveLength(2);
  view.rerender(
    <PanelUIProvider reducedMotion>
      <Slider native step={0.1} />
    </PanelUIProvider>
  );
  await settle();
  expect(screen.getAllByRole("slider")).toHaveLength(1);
});
it("root custom classes do not spread to track or thumbs and hit region never changes track height", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <Slider
        className="root-only"
        trackClassName="isolated-track"
        size="lg"
        color="success"
      />
    </PanelUIProvider>
  );
  await settle();
  const track = document.querySelector(".isolated-track");
  expect(track?.className).not.toContain("root-only");
  expect(track?.className).toContain("h-[48px]");
  expect(screen.getByRole("slider").className).not.toContain("root-only");
  expect(readTaroStyle(screen.getByRole("slider"))).toContain(
    '"width":"64rpx"'
  );
  expect(readTaroStyle(track?.querySelector('[aria-hidden="true"]'))).toContain(
    '"inset":"-32rpx"'
  );
});
it("nudging a range respects the gap and step-zero still increments one unit", async () => {
  const commit = vi.fn();
  const range = renderHook(() =>
    useSliderState(
      {
        defaultRange: [20, 40],
        minStepsBetweenThumbs: 2,
        onRangeCommit: commit,
        step: 10,
      },
      true
    )
  );
  act(() => range.result.current.nudge(1, "low"));
  expect(commit).not.toHaveBeenCalled();
  act(() => range.result.current.nudge(1, "high"));
  await settle();
  expect(commit).toHaveBeenCalledExactlyOnceWith([20, 50]);
  const single = renderHook(() =>
    useSliderState({ defaultValue: 20.5, step: 0 }, true)
  );
  act(() => single.result.current.nudge(1, "high"));
  await settle();
  expect(single.result.current.value).toBe(21.5);
});
it("a long stationary press does not commit as a tap and vertical intent passes through", async () => {
  vi.useFakeTimers();
  try {
    const commit = vi.fn();
    render(
      <PanelUIProvider reducedMotion>
        <Slider onValueCommit={commit} trackClassName="intent-track" />
      </PanelUIProvider>
    );
    const track = document.querySelector(".intent-track");
    if (!track) {
      throw new Error("Missing intent track");
    }
    setElementMeasurement(track.id, {
      height: 20,
      left: 0,
      top: 0,
      width: 128,
    });
    await settle();
    fireEvent.touchStart(track, { touches: touches(64) });
    act(() => vi.advanceTimersByTime(251));
    fireEvent.touchEnd(track, { changedTouches: touches(64) });
    expect(commit).not.toHaveBeenCalled();
    fireEvent.touchStart(track, { touches: touches(64) });
    fireEvent.touchMove(track, { touches: touches(64, 40) });
    fireEvent.touchEnd(track, { changedTouches: touches(64, 40) });
    expect(commit).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});

it.each(["ltr", "rtl"] as const)(
  "%s centered thumb taps and drags across the full track",
  async (direction) => {
    const commit = vi.fn();
    render(
      <PanelUIProvider reducedMotion>
        <Direction dir={direction}>
          <Slider
            defaultValue={25}
            thumbSize={12}
            thumbPlacement="centered"
            onValueCommit={commit}
            trackClassName="centered-track"
          />
        </Direction>
      </PanelUIProvider>
    );
    const track = document.querySelector(".centered-track");
    if (!track) {
      throw new Error("Missing centered track");
    }
    setElementMeasurement(track.id, {
      height: 20,
      left: 0,
      top: 0,
      width: 200,
    });
    await settle();
    const thumb = screen.getByRole("slider");
    expect(readTaroStyle(thumb)).toContain(
      `"transform":"translateX(${direction === "ltr" ? 88 : -88}rpx)"`
    );
    const start = direction === "ltr" ? 50 : 150;
    fireEvent.touchStart(track, { touches: touches(start) });
    fireEvent.touchEnd(track, { changedTouches: touches(start) });
    await settle();
    expect(commit).toHaveBeenLastCalledWith(25);
    fireEvent.touchStart(track, { touches: touches(start) });
    fireEvent.touchMove(track, { touches: touches(100) });
    fireEvent.touchEnd(track, { changedTouches: touches(100) });
    await settle();
    expect(commit).toHaveBeenLastCalledWith(50);
    expect(readTaroStyle(thumb)).toContain(
      `"transform":"translateX(${direction === "ltr" ? 188 : -188}rpx)"`
    );
  }
);
