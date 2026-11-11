// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { DatePicker } from "../src/components/DatePicker";
import { describe } from "../src/components/DatePicker/describe";
import { PanelUIProvider } from "../src/components/Provider";

const DAY = new Date(2026, 5, 4);
const CALENDAR_LAYOUT_TIMEOUT = 3000;
const label = (day: number) =>
  new Intl.DateTimeFormat("en-u-ca-gregory-nu-latn", {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  }).format(new Date(2026, 5, day));
it("source descriptions preserve unfinished ranges and multiple counts", () => {
  expect(describe("range", { from: DAY }, "en", "gregory")).toMatch(/ –$/u);
  expect(
    describe("multiple", [DAY, new Date(2026, 5, 6)], "en", "gregory")
  ).toBe("2 dates");
  expect(describe("multiple", [], "en", "gregory")).toBeNull();
});
it("single selection closes and updates the trigger text", async () => {
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <DatePicker
        locale="en"
        open
        defaultSelected={DAY}
        onOpenChange={change}
      />
    </PanelUIProvider>
  );
  await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy(), {
    timeout: CALENDAR_LAYOUT_TIMEOUT,
  });
  fireEvent.click(screen.getByRole("button", { name: label(6) }));
  expect(change).toHaveBeenLastCalledWith(false);
  expect(screen.getByText("Jun 6, 2026")).toBeTruthy();
});
it("range stays open after its first endpoint and closes only on completion", async () => {
  const change = vi.fn();
  const select = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <DatePicker
        mode="range"
        locale="en"
        open
        defaultSelected={{ from: DAY, to: DAY }}
        onSelect={select}
        onOpenChange={change}
      />
    </PanelUIProvider>
  );
  await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy(), {
    timeout: CALENDAR_LAYOUT_TIMEOUT,
  });
  fireEvent.click(screen.getByRole("button", { name: label(8) }));
  expect(select).toHaveBeenLastCalledWith({ from: new Date(2026, 5, 8) });
  expect(change).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: label(12) }));
  expect(change).toHaveBeenLastCalledWith(false);
});
it("multiple keeps the panel open and controlled values stay owned by the caller", async () => {
  const change = vi.fn();
  const select = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <DatePicker
        mode="multiple"
        locale="en"
        open
        selected={[DAY]}
        onSelect={select}
        onOpenChange={change}
      />
    </PanelUIProvider>
  );
  await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy(), {
    timeout: CALENDAR_LAYOUT_TIMEOUT,
  });
  fireEvent.click(screen.getByRole("button", { name: label(6) }));
  expect(select).toHaveBeenLastCalledWith([DAY, new Date(2026, 5, 6)]);
  expect(change).not.toHaveBeenCalled();
  expect(
    screen.getByRole("button", { name: label(6) }).getAttribute("aria-selected")
  ).toBe("false");
});
it("disabled custom triggers cannot open the picker", async () => {
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <DatePicker disabled onOpenChange={change}>
        <button>自定义触发器</button>
      </DatePicker>
    </PanelUIProvider>
  );
  await act(async () => {
    fireEvent.click(screen.getByText("自定义触发器"));
    await Promise.resolve();
  });
  expect(change.mock.calls).toHaveLength(0);
});
