// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { DateTimePicker } from "../src/components/DateTimePicker";
import { useDateTimePicker } from "../src/components/DateTimePicker/use-model";
import { PanelUIProvider } from "../src/components/Provider";
import { calendarShortDate } from "../src/lib/date";
import { formatTime } from "../src/lib/time";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

const START = new Date(2026, 5, 15, 9, 30, 45);
const dayLabel = (day: number) =>
  new Intl.DateTimeFormat("en-u-ca-gregory-nu-latn", {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  }).format(new Date(2026, 5, day));
const wrapper = (child: React.ReactNode) => (
  <PanelUIProvider reducedMotion>{child}</PanelUIProvider>
);
it("selecting a calendar day retains the time, zeroes seconds and leaves the dialog open", () => {
  const changed = vi.fn();
  const opening = vi.fn();
  render(
    wrapper(
      <DateTimePicker
        presentation="dialog"
        open
        defaultValue={START}
        onValueChange={changed}
        onOpenChange={opening}
        locale="en"
      />
    )
  );
  fireEvent.click(screen.getByRole("button", { name: dayLabel(18) }));
  expect(changed).toHaveBeenLastCalledWith(new Date(2026, 5, 18, 9, 30, 0));
  expect(opening).not.toHaveBeenCalled();
  expect(screen.getByText("Done")).not.toBeNull();
  fireEvent.click(screen.getByText("Done"));
  expect(opening).toHaveBeenCalledExactlyOnceWith(false);
  expect(changed).toHaveBeenCalledTimes(1);
});
it("time-first means today and later calendar selection retains the chosen time", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 5, 4, 13, 25));
  const changed = vi.fn();
  const hook = renderHook(() => useDateTimePicker({ onValueChange: changed }));
  act(() => hook.result.current.handleTime({ hour: 21, minute: 45 }));
  expect(changed).toHaveBeenLastCalledWith(new Date(2026, 5, 4, 21, 45));
  act(() => hook.result.current.handleDay(new Date(2026, 5, 20)));
  expect(changed).toHaveBeenLastCalledWith(new Date(2026, 5, 20, 21, 45));
  vi.useRealTimers();
});
it("day-first uses the current top hour rounded and clamped to the supplied time span", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 5, 4, 7, 25));
  const changed = vi.fn();
  const hook = renderHook(() =>
    useDateTimePicker({
      minTime: { hour: 9, minute: 15 },
      onValueChange: changed,
    })
  );
  act(() => hook.result.current.handleDay(new Date(2026, 5, 20)));
  expect(changed).toHaveBeenCalledExactlyOnceWith(new Date(2026, 5, 20, 9, 15));
  vi.useRealTimers();
});
it("same-batch day and time changes compose both halves in owned state", () => {
  const changed = vi.fn();
  const hook = renderHook(() =>
    useDateTimePicker({ defaultValue: START, onValueChange: changed })
  );
  act(() => {
    hook.result.current.handleDay(new Date(2026, 5, 20));
    hook.result.current.handleTime({ hour: 18, minute: 0 });
  });
  expect(hook.result.current.value).toEqual(new Date(2026, 5, 20, 18, 0));
});
it("controlled refusal retains the accepted day and time", () => {
  const changed = vi.fn();
  const hook = renderHook(() =>
    useDateTimePicker({ onValueChange: changed, value: START })
  );
  act(() => hook.result.current.handleDay(new Date(2026, 5, 20)));
  act(() => hook.result.current.handleTime({ hour: 18, minute: 0 }));
  expect(changed).toHaveBeenLastCalledWith(new Date(2026, 5, 15, 18, 0));
  expect(hook.result.current.value).toBe(START);
  expect(hook.result.current.time).toEqual({ hour: 9, minute: 30 });
});
it("disabled state rejects stale day/time operations and opening but permits closing", () => {
  const changed = vi.fn();
  const opening = vi.fn();
  const hook = renderHook(() =>
    useDateTimePicker({
      disabled: true,
      onOpenChange: opening,
      onValueChange: changed,
    })
  );
  act(() => {
    hook.result.current.handleTime({ hour: 18, minute: 0 });
    hook.result.current.handleDay(new Date(2026, 5, 20));
    hook.result.current.setOpen(true);
  });
  expect(changed).not.toHaveBeenCalled();
  expect(opening).not.toHaveBeenCalled();
  expect(hook.result.current.time).toBeUndefined();
  act(() => hook.result.current.setOpen(false));
  expect(opening).toHaveBeenCalledWith(false);
});
it("the trigger description uses the chosen calendar and the same locale time", () => {
  const hook = renderHook(() =>
    useDateTimePicker({
      calendar: "gregory",
      hourCycle: 24,
      locale: "en",
      value: START,
    })
  );
  expect(hook.result.current.label).toBe(
    `${calendarShortDate(START, "gregory", "en")} · ${formatTime({ hour: 9, minute: 30 }, { hourCycle: 24, locale: "en" })}`
  );
});
it("inline panel is 308dp and default ruler has no duplicate large readout", () => {
  render(
    wrapper(
      <DateTimePicker
        presentation="inline"
        defaultValue={START}
        locale="en"
        hourCycle={24}
        timeLabel="Appointment time"
      />
    )
  );
  const label = screen.getByText("Appointment time");
  expect(
    readTaroStyle(label.parentElement?.parentElement?.parentElement)
  ).toContain("616rpx");
  expect(document.querySelectorAll(".panel-time-ruler")).toHaveLength(1);
  expect(screen.queryByText("Done")).toBeNull();
  expect(
    screen.getAllByText(
      formatTime({ hour: 9, minute: 30 }, { hourCycle: 24, locale: "en" })
    )
  ).toHaveLength(1);
});
it("disabled calendar and time panels expose unavailable state", () => {
  render(
    wrapper(
      <DateTimePicker
        presentation="inline"
        defaultValue={START}
        disabled
        locale="en"
      />
    )
  );
  expect(
    screen
      .getByRole("button", { name: dayLabel(18) })
      .getAttribute("aria-disabled")
  ).toBe("true");
  expect(
    document.querySelector(".panel-time-ruler")?.getAttribute("aria-disabled")
  ).toBe("true");
});
it("actual wheel selection changes the time without changing the day", async () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  render(
    wrapper(
      <DateTimePicker
        presentation="inline"
        defaultValue={START}
        layout="wheel"
        hourCycle={24}
        onValueChange={changed}
        locale="en"
      />
    )
  );
  const hour = document.querySelector<HTMLElement>(
    '.panel-time-column[aria-label="Hour"]'
  );
  if (!hour) {
    throw new Error("Missing hour");
  }
  fireEvent.touchStart(hour);
  act(() =>
    dispatchTaroEvent(hour, TARO_TEST_EVENTS.scroll, {
      scrollLeft: 0,
      scrollTop: 10 * 44,
    })
  );
  fireEvent.touchEnd(hour);
  await act(async () => {
    vi.advanceTimersByTime(80);
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(changed).toHaveBeenLastCalledWith(new Date(2026, 5, 15, 10, 30));
  vi.useRealTimers();
});
it("custom labels and format are retained across nonclosing date selection", async () => {
  const opening = vi.fn();
  render(
    wrapper(
      <DateTimePicker
        presentation="popover"
        open
        defaultValue={START}
        onOpenChange={opening}
        locale="en"
        format={(date) => `Day ${date.getDate()}`}
        doneLabel="Finish"
        timeLabel="Starts"
      />
    )
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(screen.getByText("Day 15")).not.toBeNull();
  fireEvent.click(screen.getByRole("button", { name: dayLabel(18) }));
  expect(screen.getByText("Day 18")).not.toBeNull();
  expect(opening).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Finish"));
  expect(opening).toHaveBeenCalledWith(false);
});
