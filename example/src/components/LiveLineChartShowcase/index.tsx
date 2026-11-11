import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { LiveLineChart } from "panelui-taro/live-line-chart";
import type { LiveLineChartHandle } from "panelui-taro/live-line-chart";
import { useEffect, useRef, useState } from "react";

const initial = () => {
  const now = Date.now();
  return Array.from({ length: 30 }, (_, i) => ({
    time: now - (29 - i) * 1000,
    value: 50 + Math.sin(i * 0.7) * 10,
  }));
};
export const LiveLineChartShowcase = () => {
  const [data, setData] = useState(initial);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feed, setFeed] = useState(true);
  const ref = useRef<LiveLineChartHandle>(null);
  useEffect(() => {
    if (!feed) {
      return;
    }
    const timer = setInterval(
      () =>
        setData((points) => [
          ...points.slice(-120),
          {
            time: Date.now(),
            value:
              50 +
              Math.sin(Date.now() / 1300) * 10 +
              Math.cos(Date.now() / 800) * 4,
          },
        ]),
      1000
    );
    return () => clearInterval(timer);
  }, [feed]);
  return (
    <View className="flex flex-col gap-[24px]">
      <LiveLineChart
        ref={ref}
        data={data}
        window={30}
        paused={paused}
        status={loading ? "loading" : "ready"}
        momentumColors={{}}
      >
        <LiveLineChart.Header
          title="Readings per second"
          caption="Wall-clock window · scrub past readings"
        />
        <LiveLineChart.Grid />
        <LiveLineChart.Area />
        <LiveLineChart.Line />
        <LiveLineChart.Tip />
        <LiveLineChart.Skeleton />
        <LiveLineChart.XAxis />
        <LiveLineChart.YAxis />
        <LiveLineChart.Tooltip />
      </LiveLineChart>
      <View className="flex flex-row flex-wrap gap-[16px]">
        <Button onPress={() => setPaused((value) => !value)}>
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button variant="secondary" onPress={() => setFeed((value) => !value)}>
          {feed ? "Stop feed" : "Start feed"}
        </Button>
        <Button
          variant="secondary"
          onPress={() => setLoading((value) => !value)}
        >
          Loading
        </Button>
        <Button variant="ghost" onPress={() => ref.current?.sync()}>
          Sync now
        </Button>
      </View>
    </View>
  );
};
