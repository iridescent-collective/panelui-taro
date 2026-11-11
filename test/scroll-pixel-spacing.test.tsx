// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { Calendar } from "../src/components/Calendar";
import { DateTimePicker } from "../src/components/DateTimePicker";
import { PanelUIProvider } from "../src/components/Provider";
import { TimePicker } from "../src/components/TimePicker";
import { emitTestResize, setTestMeasurement } from "./taro-api";
import * as taroApi from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

afterEach(() => vi.restoreAllMocks());

const nativeStyle = (element: Element) => {
  if (!(element instanceof HTMLElement)) {
    throw new Error("Expected a native style test element");
  }
  return JSON.parse(element.dataset.taroStyle ?? "{}");
};
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
it("keeps the DateTimePicker delegated wheel on the same late-index pixel grid", async () => {
  setTestMeasurement(300, 390);
  render(
    <PanelUIProvider reducedMotion>
      <DateTimePicker
        presentation="inline"
        layout="wheel"
        hourCycle={24}
        minuteStep={15}
        value={new Date(2026, 9, 13, 22, 45)}
      />
    </PanelUIProvider>
  );
  await settle();
  const hour = document.querySelector('.panel-time-column[aria-label="Hour"]');
  const minute = document.querySelector(
    '.panel-time-column[aria-label="Minute"]'
  );
  expect(Number(hour?.getAttribute("scrolltop"))).toBeCloseTo(22 * 46);
  expect(Number(minute?.getAttribute("scrolltop"))).toBeCloseTo(3 * 46);
});
it.each([375, 390, 430])(
  "keeps hour 22 and minute 45 on one rendered pixel grid at viewport %s",
  async (viewport) => {
    setTestMeasurement(300, viewport);
    render(
      <PanelUIProvider reducedMotion>
        <TimePicker
          presentation="inline"
          layout="wheel"
          hourCycle={24}
          minuteStep={15}
          value={{ hour: 22, minute: 45 }}
        />
      </PanelUIProvider>
    );
    await settle();
    const step = Math.round((44 * viewport) / 375);
    for (const [label, index] of [
      ["Hour", 22],
      ["Minute", 3],
    ] as const) {
      const column = document.querySelector(
        `.panel-time-column[aria-label="${label}"]`
      );
      if (!column) {
        throw new Error("Missing time column");
      }
      const content = column.querySelector('[data-taro-style*="paddingTop"]');
      if (!content) {
        throw new Error("Missing column content");
      }
      expect(nativeStyle(content.children[index]).height).toBe(`${step}px`);
      expect(Number(column.getAttribute("scrolltop"))).toBeCloseTo(
        index * step
      );
      expect(nativeStyle(content).paddingTop).toBe(`${step * 2}px`);
      expect(nativeStyle(column).height).toBe(`${step * 5}px`);
    }
  }
);
it("settles the late hour using rendered pixels rather than theoretical rpx scaling", async () => {
  vi.useFakeTimers();
  try {
    setTestMeasurement(300, 390);
    const change = vi.fn();
    render(
      <PanelUIProvider reducedMotion>
        <TimePicker
          presentation="inline"
          layout="wheel"
          hourCycle={24}
          defaultValue={{ hour: 0, minute: 0 }}
          onValueChange={change}
        />
      </PanelUIProvider>
    );
    await settle();
    const column = document.querySelector(
      '.panel-time-column[aria-label="Hour"]'
    );
    if (!column) {
      throw new Error("Missing hour");
    }
    fireEvent.touchStart(column);
    act(() =>
      dispatchTaroEvent(column, TARO_TEST_EVENTS.scroll, {
        scrollLeft: 0,
        scrollTop: 22 * 46,
      })
    );
    fireEvent.touchEnd(column);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(change).toHaveBeenLastCalledWith({ hour: 22, minute: 0 });
    expect(Number(column.getAttribute("scrolltop"))).toBeCloseTo(22 * 46);
  } finally {
    vi.useRealTimers();
  }
});
it("lays out the complete one-minute ruler on the same pixel step as its final scroll offset", async () => {
  setTestMeasurement(300, 390);
  render(
    <PanelUIProvider reducedMotion>
      <TimePicker
        presentation="inline"
        layout="ruler"
        minuteStep={1}
        value={{ hour: 23, minute: 59 }}
        readout="none"
      />
    </PanelUIProvider>
  );
  await settle();
  const ruler = document.querySelector(".panel-time-ruler");
  if (!ruler) {
    throw new Error("Missing ruler");
  }
  const content = ruler.querySelector(".flex-row");
  if (!content) {
    throw new Error("Missing ruler content");
  }
  expect(Number(ruler.getAttribute("scrollleft"))).toBeCloseTo(1439 * 12);
  const widths = [...content.children].map(
    (element) => nativeStyle(element).width
  );
  expect(widths.filter((value) => value === "12px")).toHaveLength(121);
  expect(widths[0]).toBe(`${1319 * 12}px`);
});
it("realigns an unchanged selected hour when the viewport changes", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <TimePicker
        presentation="inline"
        layout="wheel"
        hourCycle={24}
        value={{ hour: 22, minute: 0 }}
      />
    </PanelUIProvider>
  );
  await settle();
  setTestMeasurement(300, 430);
  act(() => emitTestResize());
  await settle();
  const column = document.querySelector(
    '.panel-time-column[aria-label="Hour"]'
  );
  expect(Number(column?.getAttribute("scrolltop"))).toBeCloseTo(22 * 50);
});
it("centers a late calendar year using its actual rendered row pitch", async () => {
  setTestMeasurement(300, 390);
  const scrollTo = vi.fn();
  const originalQuery = taroApi.createSelectorQuery;
  vi.spyOn(taroApi, "createSelectorQuery").mockImplementation(() => {
    const query = originalQuery();
    const node = query.node;
    query.node = (listener) =>
      node((result) => listener({ node: result.node ?? { scrollTo } }));
    return query;
  });
  render(
    <PanelUIProvider reducedMotion>
      <Calendar
        captionLayout="dropdown"
        defaultMonth={new Date(2080, 0, 1)}
        startMonth={new Date(1900, 0, 1)}
        endMonth={new Date(2100, 11, 1)}
        locale="en"
      />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Year" }));
  await settle();
  const dialog = await screen.findByRole("dialog");
  const selected = dialog.querySelector('[aria-selected="true"]');
  if (!selected) {
    throw new Error("Missing year");
  }
  const row = 42;
  expect(nativeStyle(selected).height).toBe(`${row}px`);
  const list = selected.parentElement;
  if (!list) {
    throw new Error("Missing year list");
  }
  expect(list.getAttribute("scrolltop")).toBeNull();
  expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
    top: 180 * row - (row * 6.5) / 2 + row / 2,
    animated: false,
  });
});
