// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { Calendar } from "../src/components/Calendar";
import { dayVariants } from "../src/components/Calendar/day-variants";
import * as popoverMotion from "../src/components/Popover/use-motion";
import { PanelUIProvider } from "../src/components/Provider";
import {
  monthGrid,
  addMonths,
  calendarParts,
  normalizeWeekStart,
} from "../src/lib/date";
import { emitAppShow } from "./taro-api";

afterEach(() => vi.restoreAllMocks());

const JUNE = new Date(2026, 5, 1);
const dateLabel = (day: number) =>
  new Intl.DateTimeFormat("en-u-ca-gregory-nu-latn", {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  }).format(new Date(2026, 5, day));
const dayButton = (day: number) =>
  screen.getByRole("button", { name: dateLabel(day) });
it("source date arithmetic keeps six consecutive weeks and normalizes month overflow", () => {
  const grid = monthGrid(new Date(2024, 1, 29), 1);
  expect(grid).toHaveLength(6);
  expect(grid.flat()).toHaveLength(42);
  expect(grid[0]?.[0]?.getDay()).toBe(1);
  expect(addMonths(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 1));
  expect(normalizeWeekStart(-1)).toBe(6);
  expect(calendarParts(new Date(2026, 5, 4), "gregory", "en")).toEqual({
    day: 4,
    month: 6,
    year: 2026,
  });
});
it("single selection toggles and date bounds compare days rather than timestamps", () => {
  const select = vi.fn();
  render(
    <PanelUIProvider>
      <Calendar
        defaultMonth={JUNE}
        locale="en"
        minDate={new Date(2026, 5, 4, 23)}
        onSelect={select}
      />
    </PanelUIProvider>
  );
  expect(dayButton(3).getAttribute("aria-disabled")).toBe("true");
  expect(dayButton(4).getAttribute("aria-disabled")).toBe("false");
  fireEvent.click(dayButton(4));
  expect(select).toHaveBeenLastCalledWith(new Date(2026, 5, 4));
  expect(dayButton(4).getAttribute("aria-selected")).toBe("true");
  fireEvent.click(dayButton(4));
  expect(select.mock.calls.at(-1)).toEqual([undefined]);
});
it("multiple selection removes the existing day and controlled refusal keeps the original rendering", () => {
  const select = vi.fn();
  const tree = render(
    <PanelUIProvider>
      <Calendar
        mode="multiple"
        locale="en"
        defaultMonth={JUNE}
        defaultSelected={[new Date(2026, 5, 4)]}
        onSelect={select}
      />
    </PanelUIProvider>
  );
  fireEvent.click(dayButton(6));
  expect(select).toHaveBeenLastCalledWith([
    new Date(2026, 5, 4),
    new Date(2026, 5, 6),
  ]);
  fireEvent.click(dayButton(4));
  expect(select).toHaveBeenLastCalledWith([new Date(2026, 5, 6)]);
  tree.rerender(
    <PanelUIProvider>
      <Calendar
        mode="multiple"
        locale="en"
        defaultMonth={JUNE}
        selected={[new Date(2026, 5, 4)]}
        onSelect={select}
      />
    </PanelUIProvider>
  );
  fireEvent.click(dayButton(6));
  expect(dayButton(6).getAttribute("aria-selected")).toBe("false");
});
it("range follows open, complete and earlier restart states", () => {
  const select = vi.fn();
  render(
    <PanelUIProvider>
      <Calendar
        mode="range"
        locale="en"
        defaultMonth={JUNE}
        onSelect={select}
      />
    </PanelUIProvider>
  );
  fireEvent.click(dayButton(10));
  fireEvent.click(dayButton(5));
  expect(select).toHaveBeenLastCalledWith({ from: new Date(2026, 5, 5) });
  fireEvent.click(dayButton(12));
  expect(select).toHaveBeenLastCalledWith({
    from: new Date(2026, 5, 5),
    to: new Date(2026, 5, 12),
  });
  fireEvent.click(dayButton(20));
  expect(select).toHaveBeenLastCalledWith({ from: new Date(2026, 5, 20) });
});
it("navigation reflects explicit month bounds and ignores broader selectable bounds", () => {
  render(
    <PanelUIProvider>
      <Calendar
        locale="en"
        defaultMonth={JUNE}
        startMonth={JUNE}
        endMonth={JUNE}
        minDate={new Date(2026, 0, 1)}
        maxDate={new Date(2026, 11, 31)}
      />
    </PanelUIProvider>
  );
  expect(
    screen
      .getByRole("button", { name: "Previous month" })
      .getAttribute("aria-disabled")
  ).toBe("true");
  expect(
    screen
      .getByRole("button", { name: "Next month" })
      .getAttribute("aria-disabled")
  ).toBe("true");
});
it("today refreshes after returning to the foreground", () => {
  vi.useFakeTimers();
  try {
    vi.setSystemTime(new Date(2026, 5, 4, 23, 59));
    render(
      <PanelUIProvider>
        <Calendar locale="en" defaultMonth={JUNE} />
      </PanelUIProvider>
    );
    expect(dayButton(4).innerHTML).toContain("border-[2px]");
    vi.setSystemTime(new Date(2026, 5, 5, 1));
    act(() => emitAppShow());
    expect(dayButton(5).innerHTML).toContain("border-[2px]");
    expect(dayButton(4).innerHTML).not.toContain("border-[2px]");
  } finally {
    vi.useRealTimers();
  }
});

it("month options use the Panel theme rather than the host application's accent utility", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <Calendar defaultMonth={JUNE} locale="en" captionLayout="dropdown" />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Month" }));
  const dialog = await screen.findByRole("dialog");
  const selected = dialog.querySelector('[aria-selected="true"]');
  expect(selected?.className).toContain("bg-[var(--panel-accent)]");
});

it("controlled month follows timestamp changes even when the owner reuses a Date object", () => {
  const month = new Date(2026, 5, 1);
  const tree = render(
    <PanelUIProvider>
      <Calendar month={month} locale="en" />
    </PanelUIProvider>
  );
  expect(screen.getByText("June 2026")).toBeTruthy();
  month.setMonth(6);
  tree.rerender(
    <PanelUIProvider>
      <Calendar month={month} locale="en" />
    </PanelUIProvider>
  );
  expect(screen.getByText("July 2026")).toBeTruthy();
});

it("overlapping day states preserve upstream variant precedence", () => {
  const disabled = dayVariants({ disabled: true, selected: true }).label();
  expect(disabled).toContain(
    "text-[color:var(--panel-muted-foreground-opacity-30)]"
  );
  expect(disabled).not.toContain(
    "text-[color:var(--panel-primary-foreground)]"
  );
  const outside = dayVariants({ outside: true, selected: true }).label();
  expect(outside).toContain(
    "text-[color:var(--panel-muted-foreground-opacity-40)]"
  );
  const today = dayVariants({ selected: true, today: true }).label();
  expect(today).toContain("text-[color:var(--panel-primary-foreground)]");
});

it("year dropdown retains entry motion with overshoot clamped", async () => {
  const motion = vi.spyOn(popoverMotion, "usePopoverMotion");
  render(
    <PanelUIProvider>
      <Calendar
        defaultMonth={JUNE}
        locale="en"
        captionLayout="dropdown"
        startMonth={new Date(1900, 0, 1)}
        endMonth={new Date(2026, 11, 1)}
      />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Year" }));
  const dialog = await screen.findByRole("dialog");
  expect(dialog.style.transform).toContain("scale(");
  expect(motion).toHaveBeenCalledWith(true, true, expect.any(String), true);
});
