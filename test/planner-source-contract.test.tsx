// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Planner } from "../src/components/Planner";
import {
  visibleEntries,
  bucketByDay,
  entriesOn,
  summariseMonth,
  dayAccessibilityLabel,
  sortByTime,
} from "../src/components/Planner/planner-entries";
import { plannerGridTarget } from "../src/components/Planner/planner-grid-navigation";
import { millisecondsUntilNextLocalDay } from "../src/components/Planner/planner-today";
import {
  weekRange,
  weekIndex,
  weekAnchor,
} from "../src/components/Planner/planner-weeks";
import { PanelUIProvider } from "../src/components/Provider";
import { monthGrid } from "../src/lib/date";
import fixtures from "./fixtures/planner-source.json";
import { TARO_TEST_EVENTS, dispatchTaroEvent } from "./taro-components";

for (const fixture of fixtures.overflow) {
  it(`source overflow ${fixture.count}/${fixture.limit}`, () => {
    expect(
      visibleEntries(
        Array.from({ length: fixture.count }, (_, index) => index),
        fixture.limit
      )
    ).toEqual(fixture.result);
  });
}
for (const fixture of fixtures.navigation) {
  it(`source nav ${fixture.key}/${fixture.index}/${fixture.sparse}`, () => {
    expect(
      plannerGridTarget(
        fixture.key,
        fixture.index,
        42,
        7,
        fixture.sparse ? (index) => index >= 3 && index <= 37 : undefined
      )
    ).toBe(fixture.result);
  });
}
const localDate = (input: number[]) =>
  new Date(
    input[0] ?? 2026,
    input[1] ?? 0,
    input[2] ?? 1,
    input[3] ?? 0,
    input[4] ?? 0,
    input[5] ?? 0
  );
const parts = (date: Date) => [
  date.getFullYear(),
  date.getMonth(),
  date.getDate(),
  date.getHours(),
];
for (const fixture of fixtures.ranges) {
  it(`source weeks ${fixture.input.join("-")}/${fixture.start}`, () => {
    const date = localDate(fixture.input);
    const range = weekRange(date, fixture.start, 2, 3);
    expect(range.map(parts)).toEqual(fixture.result);
    expect(weekIndex(range, date, fixture.start)).toBe(fixture.index);
    expect(parts(weekAnchor(range[2] ?? date))).toEqual(fixture.anchor);
  });
}
for (const fixture of fixtures.midnight) {
  it(`source next midnight ${fixture.input.join("-")}`, () => {
    expect(millisecondsUntilNextLocalDay(localDate(fixture.input))).toBe(
      fixture.result
    );
  });
}
const ENTRIES = [
  {
    category: "lesson",
    date: new Date(2026, 8, 30),
    id: "outside",
    label: "Outside",
  },
  {
    category: "lesson",
    date: new Date(2026, 9, 14, 9),
    icon: <span>R</span>,
    id: "a",
    label: "Reading",
  },
  {
    category: "lesson",
    date: new Date(2026, 9, 14, 12),
    id: "b",
    label: "Writing",
  },
  {
    category: "trip",
    color: "#ff0000",
    date: new Date(2026, 9, 14, 0),
    icon: <span>H</span>,
    id: "c",
    label: "Holiday",
  },
];
const CATEGORIES = [
  { id: "lesson", label: "Lessons" },
  { id: "trip", label: "Trips" },
];
it("source day buckets share local midnight and summaries omit adjacent-month cells", () => {
  const days = bucketByDay(ENTRIES);
  expect(entriesOn(days, new Date(2026, 9, 14))).toHaveLength(3);
  expect(
    summariseMonth(
      days,
      monthGrid(new Date(2026, 9, 1), 0, "gregory", "en-US"),
      CATEGORIES,
      (date) => date.getMonth() === 9
    )
  ).toEqual({
    categories: [
      { count: 2, id: "lesson", label: "Lessons" },
      { count: 1, id: "trip", label: "Trips" },
    ],
    total: 3,
  });
  expect(
    dayAccessibilityLabel(
      "October 14",
      entriesOn(days, new Date(2026, 9, 14)),
      new Map(CATEGORIES.map((c) => [c.id, c.label]))
    )
  ).toBe("October 14, 3 entries: Lessons, Trips");
  expect(sortByTime(ENTRIES.slice(1)).map((entry) => entry.id)).toEqual([
    "c",
    "a",
    "b",
  ]);
});
it("six-row grid selects and clears a day, calls onDayPress first and keeps header/nav slots and legend totals", () => {
  const called: string[] = [];
  render(
    <PanelUIProvider reducedMotion>
      <Planner
        defaultMonth={new Date(2026, 9, 1)}
        locale="en-US"
        entries={ENTRIES}
        categories={CATEGORIES}
        onDayPress={() => called.push("press")}
        onSelectedChange={() => called.push("select")}
      >
        <Planner.Header>
          <Planner.Nav />
          <Planner.Title />
          <Planner.Today />
        </Planner.Header>
        <Planner.Grid />
        <Planner.Legend counts>
          <Planner.Summary />
        </Planner.Legend>
        <Planner.Footer>Footer</Planner.Footer>
      </Planner>
    </PanelUIProvider>
  );
  const date = screen.getByRole("button", {
    name: /October 14, 2026, 3 entries/u,
  });
  fireEvent.click(date);
  expect(called).toEqual(["press", "select"]);
  expect(date.getAttribute("aria-selected")).toBe("true");
  fireEvent.click(date);
  expect(date.getAttribute("aria-selected")).toBe("false");
  expect(screen.getByText("Lessons 2")).toBeTruthy();
  expect(screen.getByText("3 entries")).toBeTruthy();
  expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(44);
  fireEvent.click(screen.getByRole("button", { name: "Next month" }));
  expect(screen.getAllByText("November 2026")).toHaveLength(2);
});
it("controlled month and selection emit requests without speculative visual changes", () => {
  const month = vi.fn();
  const selected = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Planner
        month={new Date(2026, 9, 1)}
        selected={null}
        locale="en-US"
        onMonthChange={month}
        onSelectedChange={selected}
      >
        <Planner.Header>
          <Planner.Title />
          <Planner.Nav />
        </Planner.Header>
        <Planner.Grid />
      </Planner>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Next month" }));
  expect(month).toHaveBeenCalledTimes(1);
  expect(screen.getByText("October 2026")).toBeTruthy();
  const day = screen.getByRole("button", { name: /October 14, 2026/u });
  fireEvent.click(day);
  expect(selected).toHaveBeenCalledTimes(1);
  expect(day.getAttribute("aria-selected")).toBe("false");
});
it("tiles omit adjacent-month buttons but retain fixed grid height; calendar names entries and custom renderDay fully owns its cell", () => {
  const { rerender, container } = render(
    <PanelUIProvider reducedMotion>
      <Planner
        frame={false}
        variant="tiles"
        defaultMonth={new Date(2026, 9, 1)}
        locale="en-US"
        entries={ENTRIES}
      >
        <Planner.Grid />
      </Planner>
    </PanelUIProvider>
  );
  expect(screen.getAllByRole("button")).toHaveLength(31);
  expect(
    [...container.querySelectorAll<HTMLElement>("[data-taro-style]")].some(
      (el) => el.dataset.taroStyle?.includes("808rpx")
    )
  ).toBe(true);
  rerender(
    <PanelUIProvider reducedMotion>
      <Planner
        variant="calendar"
        defaultMonth={new Date(2026, 9, 1)}
        entries={ENTRIES}
      >
        <Planner.Grid />
      </Planner>
    </PanelUIProvider>
  );
  expect(screen.getByText("Reading")).toBeTruthy();
  rerender(
    <PanelUIProvider reducedMotion>
      <Planner defaultMonth={new Date(2026, 9, 1)}>
        <Planner.Grid
          renderDay={(state) => (
            <span>{`Custom ${state.date.toDateString()}`}</span>
          )}
        />
      </Planner>
    </PanelUIProvider>
  );
  expect(screen.queryAllByRole("button")).toHaveLength(0);
});
it("Scroller bounds mounting and reports the month of its first sufficiently visible week", () => {
  const changed = vi.fn();
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <Planner defaultMonth={new Date(2026, 9, 1)} onMonthChange={changed} fill>
        <Planner.Header>
          <Planner.Title />
        </Planner.Header>
        <Planner.Scroller />
      </Planner>
    </PanelUIProvider>
  );
  expect(screen.getAllByRole("button").length).toBeLessThan(210);
  const scroll =
    container.querySelector<HTMLElement>("[data-taro-scroll-x]") ??
    [...container.querySelectorAll<HTMLElement>("div")].find((el) =>
      el.hasAttribute("scrolltop")
    );
  if (!scroll) {
    throw new Error("Scroller missing");
  }
  act(() =>
    dispatchTaroEvent(scroll, TARO_TEST_EVENTS.scroll, { scrollTop: 96 * 60 })
  );
  expect(changed).toHaveBeenCalledTimes(1);
});
it("detail title and description retain the source vertical stack and spacing", () => {
  const style = document.createElement("style");
  style.textContent = ".flex{display:flex}.flex-col{flex-direction:column}";
  document.head.append(style);
  try {
    render(
      <PanelUIProvider reducedMotion>
        <Planner defaultSelected={new Date(2026, 9, 14)}>
          <Planner.Details title="Selected day" description="Two entries">
            {() => <span>Entries</span>}
          </Planner.Details>
        </Planner>
      </PanelUIProvider>
    );
    const title = screen.getByText("Selected day");
    const description = screen.getByText("Two entries");
    expect(title.parentElement).toBe(description.parentElement);
    const layout = getComputedStyle(title.parentElement as Element);
    expect(layout.display).toBe("flex");
    expect(layout.flexDirection).toBe("column");
  } finally {
    style.remove();
  }
});
