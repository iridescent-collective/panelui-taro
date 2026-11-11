import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import {
  LiveLineChart,
  type LiveLinePoint,
} from "panelui-taro/live-line-chart";
import { Tooltip } from "panelui-taro/tooltip";
import { useEffect, useRef, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const CHART_HEADER = "px-4 pt-3.5";
function useLiveFeed(interval = 400, start = 240) {
  const [points, setPoints] = useState<LiveLinePoint[]>([]);
  const last = useRef(start);
  useEffect(() => {
    const tick = setInterval(() => {
      const drift = (Math.random() - 0.48) * 26;
      last.current = Math.max(40, Math.min(460, last.current + drift));
      setPoints((current) => [
        ...current.slice(-400),
        { time: Date.now(), value: Math.round(last.current) },
      ]);
    }, interval);
    return () => clearInterval(tick);
  }, [interval]);
  return points;
}
function LiveLineBasicVersion() {
  const points = useLiveFeed();
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Requests / sec</Frame.Title>
          <Frame.Action>Live</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <LiveLineChart data={points} window={30} className="pb-2">
            <LiveLineChart.Header className={CHART_HEADER} title="Right now" />
            <LiveLineChart.Grid />
            <LiveLineChart.Area />
            <LiveLineChart.Line />
            <LiveLineChart.Tip />
            <LiveLineChart.XAxis />
          </LiveLineChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function LiveLineMomentumVersion() {
  const points = useLiveFeed(320, 180);
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Momentum</Frame.Title>
          <Frame.Action>Up, down, flat</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <LiveLineChart
            data={points}
            window={24}
            momentumColors={{}}
            className="pb-2"
          >
            <LiveLineChart.Header
              className={CHART_HEADER}
              title="Throughput"
              caption="The colour is the last few readings, not the value"
            />
            <LiveLineChart.Grid />
            <LiveLineChart.YAxis />
            <LiveLineChart.Area />
            <LiveLineChart.Line />
            <LiveLineChart.Tip />
            <LiveLineChart.XAxis />
          </LiveLineChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function LiveLineReadbackVersion() {
  const points = useLiveFeed();
  const [held, setHeld] = useState(false);
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Read it back</Frame.Title>
          <Frame.Action>
            <Button
              size="sm"
              variant="ghost"
              onPress={() => setHeld((value) => !value)}
            >
              {held ? "Resume" : "Hold"}
            </Button>
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <LiveLineChart
            data={points}
            window={30}
            paused={held}
            className="pb-2"
          >
            <LiveLineChart.Header
              className={CHART_HEADER}
              title="Requests / sec"
              caption="Drag across the plot"
            />
            <LiveLineChart.Grid />
            <LiveLineChart.YAxis />
            <LiveLineChart.Area />
            <LiveLineChart.Line />
            <LiveLineChart.Tip />
            <LiveLineChart.Tooltip />
            <LiveLineChart.XAxis />
          </LiveLineChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "live-line-chart",
  name: "LiveLineChart",
  summary: "A reading that keeps arriving, against a window that keeps moving",
  layout: "pager",
  demos: [
    {
      label: "Live",
      id: "live",
      fullPage: true,
      description:
        "A window sliding against the clock, with the tip riding the newest reading.",
      render: () => <LiveLineBasicVersion />,
    },
    {
      label: "Momentum",
      id: "momentum",
      fullPage: true,
      description:
        "Colour taken from the direction of travel rather than from one fixed hue.",
      render: () => <LiveLineMomentumVersion />,
    },
    {
      label: "Read back",
      id: "read-back",
      fullPage: true,
      description:
        "Drag back through the window, and hold the window still to talk about it.",
      render: () => <LiveLineReadbackVersion />,
    },
  ],
};
