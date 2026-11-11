// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import {
  CandlestickChart,
  useCandlestickChart,
} from "../src/components/CandlestickChart";
import type { CandlestickChartProps } from "../src/components/CandlestickChart";
import {
  candleExtent,
  candleColumns,
  candlePath,
  candleHighlight,
  ohlcOf,
} from "../src/components/CandlestickChart/math";
import { useChart } from "../src/components/LineChart/context";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/candlestick-chart-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA = [
  { close: 105, date: "Mon", high: 108, low: 94, open: 100 },
  { close: 100, date: "Tue", high: 111, low: 93, open: 105 },
  { close: 100, date: "Wed", high: 103, low: 97, open: 100 },
  { close: 104, date: "Missing", high: null, low: 93, open: 100 },
];
const Probe = () => {
  const state = useCandlestickChart();
  const { extent, plot } = useChart("probe");
  return (
    <span data-testid="candle-state">
      {JSON.stringify({ ...state, extent, plot })}
    </span>
  );
};
Probe.layer = "header" as const;
const probe = () =>
  JSON.parse(screen.getByTestId("candle-state").textContent ?? "{}");
const model = (props: Partial<CandlestickChartProps>) => (
  <PanelUIProvider reducedMotion>
    <CandlestickChart data={DATA} {...props}>
      <CandlestickChart.Header title="Session prices" value="100" legend />
      <CandlestickChart.Grid />
      <CandlestickChart.Candles />
      <CandlestickChart.XAxis />
      <CandlestickChart.YAxis />
      <CandlestickChart.Tooltip />
      <Probe />
    </CandlestickChart>
  </PanelUIProvider>
);
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const svg = () =>
  decodeURIComponent(
    document
      .querySelector('img[src^="data:image/svg+xml"]')
      ?.getAttribute("src")
      ?.split(",")[1] ?? ""
  );
it.each(FIXTURES.frames)(
  "matches pinned wick/body grow and full active highlight %#",
  ({ input, wantRising, wicks, expected }) => {
    const options = {
      ...input,
      columns: candleColumns(input.data, "open", "high", "low", "close"),
    };
    expect(candlePath(options, wantRising, wicks)).toEqual(expected.body);
    expect(candleHighlight(options, wantRising)).toEqual(expected.highlight);
  }
);
it.each(FIXTURES.domains)(
  "matches pinned lowest low/highest high nonzero domain %#",
  ({ data, yDomain, expected }) => {
    const domain = yDomain
      ? ([yDomain[0], yDomain[1]] as [number, number])
      : undefined;
    expect(candleExtent(data, "open", "high", "low", "close", domain)).toEqual(
      expected
    );
  }
);
it("renders source direction paths and price-axis gutter with complete accessible OHLC", async () => {
  setTestMeasurement(300, 375);
  render(model({ id: "consumer-candle" }));
  await settle();
  expect(probe().extent).toEqual([91.2, 112.8]);
  expect(probe().plot).toEqual({
    height: 153.5,
    left: 48,
    top: 12,
    width: 242,
  });
  expect(svg().match(/<path /gu)).toHaveLength(6);
  expect(svg()).toContain('fill="#10b981"');
  expect(svg()).toContain('fill="#ef4444"');
  expect(
    screen.getByRole("img", { name: "Candlestick chart, 4 data entries" })
  ).toBeTruthy();
  expect(
    screen.getByLabelText(
      "date, Mon. open, 100. high, 108. low, 94. close, 105"
    )
  ).toBeTruthy();
});
it("scrubs bands, fades group and redraws selected candle at full source shape", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(model({ onActiveIndexChange: change }));
  await settle();
  const pointer = document.querySelector("canvas.panel-candle-pointer");
  if (!pointer) {
    throw new Error("Missing candle pointer");
  }
  fireEvent.touchStart(pointer, {
    touches: [{ identifier: 9, x: 130, y: 30 }],
  });
  expect(probe().activeIndex).toBe(1);
  expect(svg()).toContain('opacity="0.3"');
  expect(screen.getByText("Tue")).toBeTruthy();
  expect(screen.getByText("-5 (-4.76%)")).toBeTruthy();
  expect(screen.getByText("O")).toBeTruthy();
  expect(screen.getByText("C")).toBeTruthy();
  fireEvent.touchMove(pointer, { touches: [{ identifier: 9, x: 210, y: 30 }] });
  expect(probe().activeIndex).toBe(2);
  fireEvent.touchEnd(pointer);
  expect(probe().activeIndex).toBe(-1);
  expect(change.mock.calls.map(([index]) => index)).toEqual([1, 2, -1]);
});
it("date labels thin by68pt and stay52pt wide instead of clipping into narrow candles", async () => {
  setTestMeasurement(300, 375);
  render(
    model({
      data: Array.from({ length: 30 }, (_, index) => ({
        ...DATA[0],
        date: `Day${index}`,
      })),
    })
  );
  await settle();
  expect(screen.getByText("Day0").dataset.taroStyle).toContain(
    '"width":"104rpx"'
  );
  expect(screen.getByText("Day10")).toBeTruthy();
  expect(screen.getByText("Day20")).toBeTruthy();
  expect(screen.queryByText("Day1")).toBeNull();
});
it("missing any OHLC value leaves a gap and custom keys preserve full contracts", async () => {
  setTestMeasurement(300, 375);
  const custom = DATA.map((row) => ({
    c: row.close,
    day: row.date,
    h: row.high,
    l: row.low,
    o: row.open,
  }));
  render(
    model({
      closeDataKey: "c",
      data: custom,
      highDataKey: "h",
      lowDataKey: "l",
      openDataKey: "o",
      xDataKey: "day",
    })
  );
  await settle();
  expect(probe().extent).toEqual([91.2, 112.8]);
  expect(ohlcOf(custom[3], "o", "h", "l", "c")).toBeNull();
  expect(screen.getByText("Mon")).toBeTruthy();
});
it("loading retains frame and grid with no invented placeholder candles", async () => {
  setTestMeasurement(300, 375);
  const view = render(model({ status: "loading" }));
  await settle();
  expect(svg()).not.toContain("<path ");
  expect(svg()).toContain("<line ");
  expect(document.querySelector("canvas.panel-candle-pointer")).toBeNull();
  view.rerender(model({ status: "ready" }));
  await settle();
  expect(svg().match(/<path /gu)).toHaveLength(6);
  view.rerender(model({ status: "loading" }));
  await settle();
  expect(svg()).not.toContain("<path ");
  expect(svg()).toContain("<line ");
});
