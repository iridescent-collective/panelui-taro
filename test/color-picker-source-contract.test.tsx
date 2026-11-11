// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ColorPicker } from "../src/components/ColorPicker";
import { COLOR_WHEEL_SVG } from "../src/components/ColorPicker/drawing";
import {
  areaColor,
  trackFraction,
  wheelColor,
} from "../src/components/ColorPicker/math";
import { useColorTouch } from "../src/components/ColorPicker/use-touch";
import { Direction } from "../src/components/Direction";
import { PanelUIProvider } from "../src/components/Provider";
import type { useElementLayout } from "../src/hooks/use-element-layout";
import FIXTURES from "./fixtures/color-picker-source.json";
import {
  showActionSheet,
  setTestMeasurement,
  setElementMeasurement,
} from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

const sample = (value: string) => (
  <PanelUIProvider reducedMotion>
    <ColorPicker value={value}>
      <ColorPicker.Field label="Accent" />
      <ColorPicker.Preview />
      <ColorPicker.Channel channel="alpha" />
    </ColorPicker>
  </PanelUIProvider>
);

const nudgeSample = (value: string) => (
  <PanelUIProvider>
    <ColorPicker value={value}>
      <ColorPicker.Hue />
      <ColorPicker.Preview showValue />
    </ColorPicker>
  </PanelUIProvider>
);

it.each(FIXTURES.frames)(
  "matches source geometry $input.sign/$input.width/$input.x/$input.y/$input.thumb",
  ({ input, output }) => {
    expect(
      areaColor(input.x, input.y, input.width, input.height, input.sign)
    ).toEqual(output.area);
    expect(
      trackFraction(input.x, input.width, input.thumb, input.sign)
    ).toBeCloseTo(output.track, 10);
    const wheel = wheelColor(input.x, input.y, input.diameter / 2);
    expect(wheel.h).toBeCloseTo(output.wheel.h, 10);
    expect(wheel.s).toBeCloseTo(output.wheel.s, 10);
  }
);
const flush = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const point = (x: number, y = 90) => ({
  clientX: x,
  clientY: y,
  identifier: 1,
});
it.each(["sm", "md", "lg"] as const)(
  "%s RTL picker thumbs use one physical origin instead of being anchored to both sides",
  async (size) => {
    setTestMeasurement(300, 375);
    const style = document.createElement("style");
    style.textContent = ".rtl-thumb.start-0{right:0px}";
    document.head.append(style);
    try {
      const view = render(
        <PanelUIProvider reducedMotion>
          <Direction dir="rtl">
            <ColorPicker size={size} value="#0080ff80">
              <ColorPicker.Area thumbClassName="rtl-thumb" />
              <ColorPicker.Wheel thumbClassName="rtl-thumb" />
              <ColorPicker.Hue thumbClassName="rtl-thumb" />
              <ColorPicker.Brightness thumbClassName="rtl-thumb" />
              <ColorPicker.Alpha thumbClassName="rtl-thumb" />
            </ColorPicker>
          </Direction>
        </PanelUIProvider>
      );
      await flush();
      const thumbs = view.container.querySelectorAll(".rtl-thumb");
      expect(thumbs).toHaveLength(5);
      for (const thumb of thumbs) {
        expect(getComputedStyle(thumb).left).toBe("0px");
        expect(getComputedStyle(thumb).right).toBe("auto");
      }
    } finally {
      style.remove();
    }
  }
);
const captureSample = (part: "Area" | "Wheel", disabled: boolean) => {
  const Control = ColorPicker[part];
  return (
    <PanelUIProvider reducedMotion>
      <ColorPicker disabled={disabled} defaultValue="#ff0000">
        <Control />
      </ColorPicker>
    </PanelUIProvider>
  );
};
it.each(["Area", "Wheel"] as const)(
  "%s captures page scrolling before the first touch and releases it when disabled",
  (part) => {
    const view = render(captureSample(part, false));
    const control = screen.getByLabelText(
      part === "Area" ? "Saturation and brightness" : "Hue and saturation"
    );
    expect(control.dataset.taroCatchMove).toBe("true");
    view.rerender(captureSample(part, true));
    expect(control.dataset.taroCatchMove).toBe("false");
    view.rerender(captureSample(part, false));
    expect(control.dataset.taroCatchMove).toBe("true");
  }
);
it.each(["Area", "Wheel"] as const)(
  "%s uses its current viewport origin after the surrounding page scrolls",
  async (part) => {
    setTestMeasurement(300, 375);
    const commit = vi.fn();
    const Control = ColorPicker[part];
    render(
      <PanelUIProvider reducedMotion>
        <ColorPicker defaultValue="#ff0000" onValueCommit={commit}>
          <Control />
        </ColorPicker>
      </PanelUIProvider>
    );
    await flush();
    const area = part === "Area";
    const control = screen.getByLabelText(
      area ? "Saturation and brightness" : "Hue and saturation"
    );
    setElementMeasurement(control.id, {
      height: area ? 180 : 240,
      left: 20,
      top: 100,
      width: area ? 300 : 240,
    });
    const center = point(area ? 170 : 140, area ? 190 : 220);
    fireEvent.touchStart(control, { touches: [center] });
    fireEvent.touchEnd(control, { changedTouches: [center] });
    await flush();
    expect(commit).toHaveBeenCalledExactlyOnceWith(
      area ? "#804040" : "#ffffff"
    );
  }
);
it.each(["cancel", "disable", "unmount"] as const)(
  "a pending viewport measurement cannot commit after %s",
  (action) => {
    const apply = vi.fn();
    const measure = vi.fn<ReturnType<typeof useElementLayout>["refresh"]>();
    const hook = renderHook(
      ({ enabled }) => useColorTouch(enabled, false, 1, apply, measure),
      { initialProps: { enabled: true } }
    );
    act(() => {
      hook.result.current.onTouchStart({ touches: [point(100, 100)] });
      hook.result.current.onTouchEnd({ changedTouches: [point(100, 100)] });
    });
    if (action === "cancel") {
      act(() => hook.result.current.onTouchCancel());
    } else if (action === "disable") {
      hook.rerender({ enabled: false });
    } else {
      hook.unmount();
    }
    act(() =>
      measure.mock.calls[0][1]?.({ height: 240, left: 0, top: 0, width: 240 })
    );
    expect(apply).not.toHaveBeenCalled();
  }
);
it("uses HSV as truth through black values and commits swatches in requested format", () => {
  const change = vi.fn();
  const commit = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <ColorPicker
        defaultValue="#ff0000"
        format="rgb"
        onValueChange={change}
        onValueCommit={commit}
      >
        <ColorPicker.Swatches colors={["#000", "#00ff0080", "invalid"]} />
        <ColorPicker.Preview showValue />
        <ColorPicker.Channel channel="hue" />
      </ColorPicker>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "#00ff0080" }));
  expect(change).toHaveBeenLastCalledWith("rgba(0, 255, 0, 0.5)");
  expect(commit).toHaveBeenLastCalledWith("rgba(0, 255, 0, 0.5)");
  expect(screen.getByText("120°")).toBeTruthy();
  expect(screen.getAllByRole("button")).toHaveLength(2);
  expect((COLOR_WHEEL_SVG.match(/<path /gu) ?? []).length).toBe(120);
});
it("tracks native area coordinates, mirrors saturation under RTL and keeps wheel orientation", async () => {
  setTestMeasurement(300, 375);
  const commit = vi.fn();
  const view = render(
    <PanelUIProvider reducedMotion>
      <Direction dir="rtl">
        <ColorPicker onValueCommit={commit}>
          <ColorPicker.Area />
          <ColorPicker.Hue />
          <ColorPicker.Alpha />
          <ColorPicker.Wheel />
          <ColorPicker.Preview showValue />
        </ColorPicker>
      </Direction>
    </PanelUIProvider>
  );
  await flush();
  const area = screen.getByLabelText("Saturation and brightness");
  fireEvent.touchStart(area, { touches: [point(0, 0)] });
  fireEvent.touchEnd(area, { changedTouches: [point(0, 0)] });
  await flush();
  expect(commit).toHaveBeenLastCalledWith("#ff0000");
  const wheel = screen.getByLabelText("Hue and saturation");
  setElementMeasurement(wheel.id, { height: 240, left: 4, top: 8, width: 240 });
  fireEvent.touchStart(wheel, { touches: [point(244, 128)] });
  fireEvent.touchEnd(wheel, { changedTouches: [point(244, 128)] });
  await flush();
  expect(commit).toHaveBeenLastCalledWith("#ff0000");
  view.unmount();
});
it("only commits track taps and horizontal gestures; blocks disabled and multi-touch changes", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  const commit = vi.fn();
  const view = render(
    <PanelUIProvider reducedMotion>
      <ColorPicker onValueChange={change} onValueCommit={commit}>
        <ColorPicker.Hue />
        <ColorPicker.Field label="Accent" onPress={change} />
      </ColorPicker>
    </PanelUIProvider>
  );
  await flush();
  const hue = screen.getByLabelText("Hue");
  fireEvent.touchStart(hue, { touches: [point(154)] });
  fireEvent.touchEnd(hue, { changedTouches: [point(154)] });
  await flush();
  expect(commit).toHaveBeenLastCalledWith("#00ffff");
  const count = commit.mock.calls.length;
  fireEvent.touchStart(hue, { touches: [point(154)] });
  fireEvent.touchMove(hue, { touches: [point(150, 150)] });
  fireEvent.touchEnd(hue, { changedTouches: [point(150, 150)] });
  expect(commit).toHaveBeenCalledTimes(count);
  view.rerender(
    <PanelUIProvider reducedMotion>
      <ColorPicker disabled onValueChange={change} onValueCommit={commit}>
        <ColorPicker.Hue />
        <ColorPicker.Field label="Accent" onPress={change} />
      </ColorPicker>
    </PanelUIProvider>
  );
  fireEvent.touchStart(screen.getByLabelText("Hue"), { touches: [point(0)] });
  fireEvent.touchEnd(screen.getByLabelText("Hue"), {
    changedTouches: [point(0)],
  });
  expect(commit).toHaveBeenCalledTimes(count);
});
it("accepts external color resets, ignores invalid colors, and preserves field/preview defaults", async () => {
  const view = render(sample("#33669980"));
  expect(screen.getByText("#33669980")).toBeTruthy();
  expect(screen.getByText("50%")).toBeTruthy();
  view.rerender(sample("#00ff00"));
  await flush();
  expect(screen.getByText("#00FF00")).toBeTruthy();
  view.rerender(sample("not-a-color"));
  await flush();
  expect(screen.getByText("#00FF00")).toBeTruthy();
});

it("an external controlled reset interrupts a native accessibility nudge animation", async () => {
  vi.useFakeTimers();
  showActionSheet.mockResolvedValueOnce({
    tapIndex: 0,
  });
  const view = render(sample("#33669980"));

  view.rerender(nudgeSample("#ff0000"));
  dispatchTaroEvent(
    screen.getByLabelText("Hue"),
    TARO_TEST_EVENTS.longPress,
    {}
  );
  await flush();
  view.rerender(nudgeSample("#00ff00"));
  await flush();
  act(() => vi.advanceTimersByTime(200));
  expect(screen.getByText("#00ff00")).toBeTruthy();
  view.unmount();
  vi.useRealTimers();
});

it.each([
  ["Hue", "#00ffff"],
  ["Brightness", "#800000"],
  ["Alpha", "#ff000080"],
] as const)(
  "%s refreshes its viewport origin after horizontal layout movement",
  async (part, expected) => {
    setTestMeasurement(300, 375);
    const commit = vi.fn();
    const Control = ColorPicker[part];
    render(
      <PanelUIProvider reducedMotion>
        <ColorPicker defaultValue="#ff0000" onValueCommit={commit}>
          <Control />
        </ColorPicker>
      </PanelUIProvider>
    );
    await flush();
    const control = screen.getByLabelText(part === "Alpha" ? "Opacity" : part);
    setElementMeasurement(control.id, {
      height: 24,
      left: 104,
      top: 100,
      width: 300,
    });
    const center = point(254, 112);
    fireEvent.touchStart(control, { touches: [center] });
    fireEvent.touchEnd(control, { changedTouches: [center] });
    await flush();
    expect(commit).toHaveBeenCalledExactlyOnceWith(expected);
  }
);

it.each([
  ["Hue", "Hue", 24, "#00ffff"],
  ["Brightness", "Brightness", 24, "#800000"],
  ["Alpha", "Opacity", 24, "#ff000080"],
  ["Area", "Saturation and brightness", 90, "#804040"],
  ["Wheel", "Hue and saturation", 150, "#ffffff"],
] as const)(
  "%s resolves the first released touch against the refreshed 150px frame instead of cached 300px dimensions",
  async (part, label, height, expected) => {
    setTestMeasurement(300, 375);
    const commit = vi.fn();
    const Control = ColorPicker[part];
    render(
      <PanelUIProvider reducedMotion>
        <ColorPicker defaultValue="#ff0000" onValueCommit={commit}>
          <Control />
        </ColorPicker>
      </PanelUIProvider>
    );
    await flush();
    const control = screen.getByLabelText(label);
    setElementMeasurement(control.id, {
      height,
      left: 40,
      top: 100,
      width: 150,
    });
    const center = point(115, 100 + height / 2);
    fireEvent.touchStart(control, { touches: [center] });
    fireEvent.touchEnd(control, { changedTouches: [center] });
    expect(commit).not.toHaveBeenCalled();
    await flush();
    expect(commit).toHaveBeenCalledExactlyOnceWith(expected);
  }
);

it("paints area gradients inside the rounded border without repeating at its edges", () => {
  render(
    <PanelUIProvider reducedMotion>
      <ColorPicker defaultValue="#0f172a">
        <ColorPicker.Area className="area-frame" />
      </ColorPicker>
    </PanelUIProvider>
  );
  const control = screen.getByLabelText("Saturation and brightness");
  const frame = control.querySelector<HTMLElement>(".area-frame")!;
  expect(frame.style.backgroundColor).toBe("");
  expect(frame.style.backgroundImage).toBe("");
  const paint = frame.firstElementChild as HTMLElement;
  expect(paint).not.toBeNull();
  expect(paint.style.backgroundColor).not.toBe("");
  expect(paint.style.backgroundImage).toContain("linear-gradient");
  expect(paint.style.backgroundRepeat).toBe("no-repeat");
  expect(paint.style.pointerEvents).toBe("none");
  expect(paint.className).toContain("inset-0");
  // The thumb stays outside the clipping frame so endpoint selections remain visible.
  expect(frame.nextElementSibling).not.toBeNull();
});
