import { Button } from "panelui-taro/button";
import { CandlestickChart } from "panelui-taro/candlestick-chart";
import { Frame } from "panelui-taro/frame";
import { Tooltip } from "panelui-taro/tooltip";
import { useEffect, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const CHART_HEADER = "px-4 pt-3.5";
const CANDLE_SESSIONS = (() => {
  const rows: {
    day: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[] = [];
  let previous = 182.4;
  for (let index = 0; index < 30; index += 1) {
    const drift = Math.sin(index * 0.7) * 2.4 + Math.cos(index * 1.9) * 1.3;
    const open = previous;
    const close = Math.max(1, open + drift);
    const spread = 0.8 + Math.abs(Math.sin(index * 2.3)) * 2.2;
    rows.push({
      day: `${((index % 28) + 1).toString()} Sep`,
      open: Number(open.toFixed(2)),
      close: Number(close.toFixed(2)),
      high: Number((Math.max(open, close) + spread).toFixed(2)),
      low: Number((Math.min(open, close) - spread).toFixed(2)),
    });
    previous = close;
  }
  return rows;
})();
const CANDLE_LAST = CANDLE_SESSIONS[CANDLE_SESSIONS.length - 1]!;
const CANDLE_FIRST = CANDLE_SESSIONS[0]!;
const price = (value: number) => `$${value.toFixed(2)}`;
function candleChange(from: number, to: number) {
  const delta = to - from;
  const percent = from === 0 ? 0 : (delta / from) * 100;
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(2)} (${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%)`;
}
function CandlestickChartSessionsVersion() {
  const [active, setActive] = useState<(typeof CANDLE_SESSIONS)[number] | null>(
    null
  );
  const shown = active ?? CANDLE_LAST;
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Northwind Materials</Frame.Title>
          <Frame.Action>Drag to inspect</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <CandlestickChart
            data={CANDLE_SESSIONS}
            xDataKey="day"
            aspectRatio={1.5}
            onActiveIndexChange={(_index, datum) =>
              setActive(datum as (typeof CANDLE_SESSIONS)[number] | null)
            }
          >
            <CandlestickChart.Header
              className={CHART_HEADER}
              title="NWM · Daily"
              value={price(shown.close)}
              caption={
                active
                  ? `${active.day} · ${candleChange(active.open, active.close)}`
                  : `30 sessions · ${candleChange(CANDLE_FIRST.open, CANDLE_LAST.close)}`
              }
              legend
            />
            <CandlestickChart.Grid />
            <CandlestickChart.Candles />
            <CandlestickChart.YAxis />
            <CandlestickChart.XAxis />
            <CandlestickChart.Tooltip formatValue={price} />
          </CandlestickChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function CandlestickChartBareVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Last ten sessions</Frame.Title>
          <Frame.Action>No axes</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <CandlestickChart
            data={CANDLE_SESSIONS.slice(-10)}
            xDataKey="day"
            aspectRatio={1.9}
            candleGap={0.42}
          >
            <CandlestickChart.Header
              className={CHART_HEADER}
              value={price(CANDLE_LAST.close)}
              caption={candleChange(
                CANDLE_SESSIONS[CANDLE_SESSIONS.length - 10]!.open,
                CANDLE_LAST.close
              )}
            />
            <CandlestickChart.Candles cornerRadius={2} />
            <CandlestickChart.XAxis />
          </CandlestickChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function CandlestickChartLoadingVersion() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("ready"), 1400);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <View className="flex-1 justify-center gap-3 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Fetching sessions</Frame.Title>
          <Frame.Action>
            {status === "loading" ? "Loading" : "Ready"}
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <CandlestickChart
            data={CANDLE_SESSIONS.slice(-16)}
            xDataKey="day"
            aspectRatio={1.6}
            status={status}
          >
            <CandlestickChart.Header
              className={CHART_HEADER}
              title="NWM · Daily"
              value={status === "loading" ? "—" : price(CANDLE_LAST.close)}
            />
            <CandlestickChart.Grid />
            <CandlestickChart.Candles />
            <CandlestickChart.XAxis />
            <CandlestickChart.Tooltip formatValue={price} />
          </CandlestickChart>
        </Frame.Panel>
      </Frame>
      <Button variant="outline" onPress={() => setStatus("loading")}>
        Load again
      </Button>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "candlestick-chart",
  name: "CandlestickChart",
  summary: "Open, high, low and close for a period, drawn as one mark",
  layout: "pager",
  demos: [
    {
      label: "Sessions",
      id: "sessions",
      fullPage: true,
      description: "Thirty sessions, with a readout that follows the finger.",
      render: () => <CandlestickChartSessionsVersion />,
    },
    {
      label: "No axes",
      id: "bare",
      fullPage: true,
      description: "The last ten, sized for a card rather than for a screen.",
      render: () => <CandlestickChartBareVersion />,
    },
    {
      label: "Loading",
      id: "loading",
      fullPage: true,
      description: "Placeholder candles growing into the real ones.",
      render: () => <CandlestickChartLoadingVersion />,
    },
  ],
};
