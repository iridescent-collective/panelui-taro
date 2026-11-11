// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { TimePicker } from "../src/components/TimePicker";
import { indexForAccessibilityAction } from "../src/components/TimePicker/accessibility";
import {
  boundedTimes,
  handEnd,
  nearestTimeIndex,
  rowAppearance,
} from "../src/components/TimePicker/math";
import { rulerWindow } from "../src/components/TimePicker/ruler-window";
import {
  clampTime,
  displayHour,
  formatTime,
  hourFromDisplay,
  meridiemLabels,
  minutesToTime,
  roundToStep,
  timeFromDate,
  timeToDate,
  timesOfDay,
} from "../src/lib/time";
import { deferred } from "./helpers/deferred";
import { showActionSheet, vibrateShort } from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

const column = (name = "Hour") => {
  const found = document.querySelector<HTMLElement>(
    `.panel-time-column[aria-label="${name}"]`
  );
  if (!found) {
    throw new Error(`Missing ${name}`);
  }
  return found;
};
const wrapper = (element: React.ReactNode) => (
  <PanelUIProvider reducedMotion>{element}</PanelUIProvider>
);
const scroll = (element: HTMLElement, offset: number, horizontal = false) =>
  act(() =>
    dispatchTaroEvent(element, TARO_TEST_EVENTS.scroll, {
      scrollLeft: horizontal ? offset : 0,
      scrollTop: horizontal ? 0 : offset,
    })
  );
it("source time arithmetic wraps, rounds and clamps the same 24-hour value", () => {
  expect(minutesToTime(-1)).toEqual({ hour: 23, minute: 59 });
  expect(roundToStep({ hour: 23, minute: 59 }, 15)).toEqual({
    hour: 0,
    minute: 0,
  });
  expect(
    clampTime(
      { hour: 7, minute: 0 },
      { hour: 9, minute: 5 },
      { hour: 17, minute: 0 }
    )
  ).toEqual({ hour: 9, minute: 5 });
  expect(displayHour(0, 12)).toBe(12);
  expect(hourFromDisplay(12, "pm", 12)).toBe(12);
  expect(hourFromDisplay(12, "am", 12)).toBe(0);
  expect(timesOfDay(7)).toHaveLength(206);
  const day = new Date(2026, 9, 13, 1, 2, 3, 4);
  const next = timeToDate({ hour: 8, minute: 20 }, day);
  expect(timeFromDate(next)).toEqual({ hour: 8, minute: 20 });
  expect(next.getSeconds()).toBe(0);
  expect(day.getHours()).toBe(1);
});
it("source bounds filter whole-time faces, nearest ties prefer earlier and empty stepped spans fall back", () => {
  const times = boundedTimes(
    30,
    { hour: 9, minute: 15 },
    { hour: 10, minute: 0 }
  );
  expect(times).toEqual([
    { hour: 9, minute: 30 },
    { hour: 10, minute: 0 },
  ]);
  expect(nearestTimeIndex(times, { hour: 9, minute: 45 })).toBe(0);
  expect(
    boundedTimes(30, { hour: 9, minute: 1 }, { hour: 9, minute: 2 })
  ).toHaveLength(48);
});
it("source fade, clock hand endpoints, ruler windows and adjustable bounds are preserved", () => {
  expect(rowAppearance(44, 0)).toEqual({
    opacity: 0.75,
    transform: "scale(0.94)",
  });
  expect(rowAppearance(88, 0).opacity).toBe(0.25);
  expect(handEnd(0, 34).x2).toBeCloseTo(66);
  expect(handEnd(0, 34).y2).toBeCloseTo(32);
  for (let at = 0; at < 1440; at += 13) {
    const window = rulerWindow(1440, at);
    expect(window.end - window.start).toBe(121);
    expect(at).toBeGreaterThanOrEqual(window.start);
    expect(at).toBeLessThan(window.end);
  }
  expect(indexForAccessibilityAction(0, 24, "decrement")).toBeUndefined();
  expect(indexForAccessibilityAction(22, 24, "increment")).toBe(23);
});
it("wheel has five 44dp rows, a single highlight and independent 12-hour columns", () => {
  render(
    wrapper(
      <TimePicker
        presentation="inline"
        defaultValue={{ hour: 14, minute: 30 }}
        minuteStep={15}
        locale="en-US"
      />
    )
  );
  expect(document.querySelectorAll(".panel-time-column")).toHaveLength(3);
  expect(readTaroStyle(column())).toContain("220px");
  expect(column("Minute").textContent).toContain("00");
  expect(column("AM or PM").textContent).toContain("PM");
});
it("meridiem column follows the requested locale", () => {
  render(
    wrapper(
      <TimePicker
        presentation="inline"
        defaultValue={{ hour: 14, minute: 30 }}
        locale="zh-CN"
      />
    )
  );
  expect(column("AM or PM").textContent).toContain(meridiemLabels("zh-CN")[1]);
});
it("a stationary finger does not prematurely commit a row", () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  render(
    wrapper(
      <TimePicker
        presentation="inline"
        hourCycle={24}
        defaultValue={{ hour: 9, minute: 0 }}
        onValueChange={changed}
      />
    )
  );
  fireEvent.touchStart(column());
  scroll(column(), 10 * 44);
  act(() => vi.advanceTimersByTime(100));
  expect(changed).not.toHaveBeenCalled();
  fireEvent.touchEnd(column());
  act(() => vi.advanceTimersByTime(80));
  expect(changed).toHaveBeenCalledExactlyOnceWith({ hour: 10, minute: 0 });
  vi.useRealTimers();
});
it("cancelled touches restore the accepted row without selecting a time", () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  render(
    wrapper(
      <TimePicker
        presentation="inline"
        hourCycle={24}
        defaultValue={{ hour: 9, minute: 0 }}
        onValueChange={changed}
      />
    )
  );
  fireEvent.touchStart(column());
  scroll(column(), 11 * 44);
  fireEvent.touchCancel(column());
  expect(changed).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(100));
  expect(changed).not.toHaveBeenCalled();
  vi.useRealTimers();
});
it("momentum reports only the final row and controlled refusal restores native scroll offset", async () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  render(
    wrapper(
      <TimePicker
        presentation="inline"
        hourCycle={24}
        value={{ hour: 9, minute: 0 }}
        onValueChange={changed}
      />
    )
  );
  fireEvent.touchStart(column());
  scroll(column(), 10 * 44);
  fireEvent.touchEnd(column());
  act(() => vi.advanceTimersByTime(40));
  scroll(column(), 11 * 44);
  act(() => vi.advanceTimersByTime(40));
  expect(changed).not.toHaveBeenCalled();
  await act(async () => {
    dispatchTaroEvent(column(), TARO_TEST_EVENTS.scrollEnd, {});
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(changed).toHaveBeenCalledExactlyOnceWith({ hour: 11, minute: 0 });
  expect(column().getAttribute("scrollTop")).toBe(String(9 * 44));
  vi.useRealTimers();
});
it("bounds refuse an out-of-range wheel report and put the hour back", async () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  render(
    wrapper(
      <TimePicker
        presentation="inline"
        hourCycle={24}
        defaultValue={{ hour: 9, minute: 0 }}
        minTime={{ hour: 9, minute: 0 }}
        onValueChange={changed}
      />
    )
  );
  fireEvent.touchStart(column());
  scroll(column(), 7 * 44);
  fireEvent.touchEnd(column());
  await act(async () => {
    vi.advanceTimersByTime(80);
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(changed).not.toHaveBeenCalled();
  expect(column().getAttribute("scrollTop")).toBe(String(9 * 44));
  vi.useRealTimers();
});
it("controlled updates during dragging wait until release", async () => {
  vi.useFakeTimers();
  const tree = render(
    wrapper(
      <TimePicker
        presentation="inline"
        hourCycle={24}
        value={{ hour: 9, minute: 0 }}
      />
    )
  );
  fireEvent.touchStart(column());
  tree.rerender(
    wrapper(
      <TimePicker
        presentation="inline"
        hourCycle={24}
        value={{ hour: 12, minute: 0 }}
      />
    )
  );
  expect(column().getAttribute("scrollTop")).toBeNull();
  fireEvent.touchEnd(column());
  await act(async () => {
    vi.advanceTimersByTime(80);
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(column().getAttribute("scrollTop")).toBe(String(12 * 44));
  vi.useRealTimers();
});
it("clock preserves SVG ticks and hand coordinates, while bounded list offers only allowed slots", () => {
  render(
    wrapper(
      <TimePicker
        presentation="inline"
        layout="clock"
        value={{ hour: 9, minute: 30 }}
        minTime={{ hour: 9, minute: 0 }}
        maxTime={{ hour: 10, minute: 0 }}
        hourCycle={24}
      />
    )
  );
  const image = document.querySelector("img");
  expect(image).not.toBeNull();
  const markup = decodeURIComponent(
    image?.getAttribute("src")?.split(",")[1] ?? ""
  );
  expect(markup.match(/<line /gu)).toHaveLength(14);
  expect(column("Time").textContent).toContain(
    formatTime({ hour: 9, minute: 30 }, { hourCycle: 24 })
  );
  expect(column("Time").textContent).not.toContain("11:00");
});
it("ruler virtualizes at most 121 cells and supports none/compact readout", () => {
  const tree = render(
    wrapper(
      <TimePicker
        presentation="inline"
        layout="ruler"
        minuteStep={1}
        value={{ hour: 12, minute: 0 }}
        readout="none"
      />
    )
  );
  expect(
    document.querySelectorAll(".panel-time-ruler .w-\\[4px\\]")
  ).toHaveLength(121);
  tree.rerender(
    wrapper(
      <TimePicker
        presentation="inline"
        layout="ruler"
        value={{ hour: 12, minute: 0 }}
        readout="compact"
      />
    )
  );
  expect(screen.getByText(formatTime({ hour: 12, minute: 0 }))).not.toBeNull();
});
it("disabled inline faces do not commit and layout switches preserve the value", () => {
  const changed = vi.fn();
  const tree = render(
    wrapper(
      <TimePicker
        presentation="inline"
        defaultValue={{ hour: 9, minute: 0 }}
        disabled
        onValueChange={changed}
      />
    )
  );
  fireEvent.touchStart(column());
  scroll(column(), 10 * 44);
  act(() => dispatchTaroEvent(column(), TARO_TEST_EVENTS.scrollEnd, {}));
  expect(changed).not.toHaveBeenCalled();
  tree.rerender(
    wrapper(
      <TimePicker
        presentation="inline"
        defaultValue={{ hour: 9, minute: 0 }}
        layout="ruler"
      />
    )
  );
  expect(screen.getByText(formatTime({ hour: 9, minute: 0 }))).not.toBeNull();
});
it("custom trigger and format work with a controlled dialog and Done requests close", () => {
  const opening = vi.fn();
  render(
    wrapper(
      <TimePicker
        presentation="dialog"
        value={{ hour: 9, minute: 0 }}
        format={() => "Morning"}
        open
        onOpenChange={opening}
      />
    )
  );
  expect(screen.getByText("Morning")).not.toBeNull();
  fireEvent.click(screen.getByText("Done"));
  expect(opening).toHaveBeenCalledWith(false);
});
it("invalid steps cannot create empty or infinite wheel columns", () => {
  render(
    wrapper(
      <TimePicker
        presentation="inline"
        minuteStep={0}
        defaultValue={{ hour: 9, minute: 0 }}
      />
    )
  );
  expect(column("Minute").textContent).toContain("59");
});
it("disabling during a pending release restores accepted position and leaves no settle timer", async () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  const tree = render(
    wrapper(
      <TimePicker
        presentation="inline"
        hourCycle={24}
        value={{ hour: 9, minute: 0 }}
        onValueChange={changed}
      />
    )
  );
  fireEvent.touchStart(column());
  scroll(column(), 11 * 44);
  fireEvent.touchEnd(column());
  tree.rerender(
    wrapper(
      <TimePicker
        presentation="inline"
        hourCycle={24}
        value={{ hour: 9, minute: 0 }}
        disabled
        onValueChange={changed}
      />
    )
  );
  await act(async () => {
    vi.advanceTimersByTime(80);
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(changed).not.toHaveBeenCalled();
  expect(column().getAttribute("scrollTop")).toBe(String(9 * 44));
  expect(
    readTaroStyle(within(column()).getByText("09").parentElement)
  ).toContain('"opacity":1');
  tree.unmount();
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});
it("source formatting has a usable fallback without Intl support", () => {
  vi.spyOn(Intl, "DateTimeFormat").mockImplementation(() => {
    throw new Error("Intl unavailable");
  });
  expect(formatTime({ hour: 21, minute: 5 }, { hourCycle: 24 })).toBe("21:05");
  expect(formatTime({ hour: 21, minute: 5 })).toBe("9:05 PM");
});
it("RN column containers and ruler tick tracks explicitly use CSS flex layouts", () => {
  const tree = render(
    wrapper(
      <TimePicker
        presentation="inline"
        hourCycle={24}
        value={{ hour: 9, minute: 0 }}
      />
    )
  );
  expect(
    within(column()).getByText("09").parentElement?.classList.contains("flex")
  ).toBe(true);
  expect(
    column().closest(".flex-row")?.parentElement?.classList.contains("flex-col")
  ).toBe(true);
  tree.rerender(
    wrapper(
      <TimePicker
        presentation="inline"
        layout="ruler"
        value={{ hour: 9, minute: 0 }}
      />
    )
  );
  expect(
    document
      .querySelector(".panel-time-ruler")
      ?.querySelector(".flex-row")
      ?.classList.contains("flex")
  ).toBe(true);
});
it("a native adjustment reply is ignored after the offered time domain changes", async () => {
  const pending = deferred<{ tapIndex: number }>();
  showActionSheet.mockReturnValueOnce(pending.promise);
  const changed = vi.fn();
  const tree = render(
    wrapper(
      <TimePicker
        presentation="inline"
        layout="clock"
        value={{ hour: 9, minute: 0 }}
        minTime={{ hour: 9, minute: 0 }}
        maxTime={{ hour: 10, minute: 0 }}
        onValueChange={changed}
      />
    )
  );
  act(() => dispatchTaroEvent(column("Time"), TARO_TEST_EVENTS.longPress));
  tree.rerender(
    wrapper(
      <TimePicker
        presentation="inline"
        layout="clock"
        value={{ hour: 10, minute: 0 }}
        minTime={{ hour: 10, minute: 0 }}
        maxTime={{ hour: 11, minute: 0 }}
        onValueChange={changed}
      />
    )
  );
  await act(async () => {
    pending.resolve({ tapIndex: 0 });
    await pending.promise;
  });
  expect(changed).not.toHaveBeenCalled();
});
it("ruler cells center the 2dp tick inside each 12dp cell", () => {
  render(
    wrapper(
      <TimePicker
        presentation="inline"
        layout="ruler"
        value={{ hour: 9, minute: 0 }}
      />
    )
  );
  const track = document.querySelector(".panel-time-ruler .flex-row");
  const cell = track?.children[1];
  expect(cell?.classList.contains("flex")).toBe(true);
  expect(cell?.classList.contains("flex-col")).toBe(true);
});
it("native haptic latency does not hold a refused wheel on an unaccepted row", async () => {
  vi.useFakeTimers();
  const pending = deferred<{ errMsg: string }>();
  vibrateShort.mockReturnValueOnce(pending.promise);
  render(
    wrapper(
      <TimePicker
        presentation="inline"
        hourCycle={24}
        value={{ hour: 9, minute: 0 }}
      />
    )
  );
  fireEvent.touchStart(column());
  scroll(column(), 11 * 44);
  fireEvent.touchEnd(column());
  await act(async () => {
    vi.advanceTimersByTime(80);
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(
    readTaroStyle(within(column()).getByText("09").parentElement)
  ).toContain('"opacity":1');
  await act(async () => {
    pending.resolve({ errMsg: "vibrateShort:ok" });
    await pending.promise;
  });
  vi.useRealTimers();
});

it("wheel row appearance updates do not retain a stale scroll command while dragging", () => {
  const changed = vi.fn();
  render(
    wrapper(
      <TimePicker
        presentation="inline"
        hourCycle={24}
        defaultValue={{ hour: 9, minute: 0 }}
        onValueChange={changed}
      />
    )
  );
  fireEvent.touchStart(column());
  scroll(column(), 11 * 44 + 10);
  expect(column().getAttribute("scrollTop")).toBeNull();
  expect(
    readTaroStyle(within(column()).getByText("11").parentElement)
  ).toContain("opacity");
  expect(changed).not.toHaveBeenCalled();
  fireEvent.touchCancel(column());
});
