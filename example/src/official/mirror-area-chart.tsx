import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import {
  MirrorAreaChart,
  type MirrorAreaChartDatum,
} from "panelui-taro/mirror-area-chart";
import { useEffect, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const CHART_HEADER = "px-4 pt-3.5";
const QUEUE_LOAD: MirrorAreaChartDatum[] = [
  { time: "08:00", jobs: 312, high: 106, share: 34 },
  { time: "08:30", jobs: 338, high: 105, share: 31 },
  { time: "09:00", jobs: 361, high: 105, share: 29 },
  { time: "09:30", jobs: 405, high: 134, share: 33 },
  { time: "10:00", jobs: 472, high: 194, share: 41 },
  { time: "10:30", jobs: 449, high: 171, share: 38 },
  { time: "11:00", jobs: 433, high: 156, share: 36 },
  { time: "11:30", jobs: 468, high: 164, share: 35 },
  { time: "12:00", jobs: 531, high: 207, share: 39 },
  { time: "12:30", jobs: 604, high: 278, share: 46 },
  { time: "13:00", jobs: 688, high: 358, share: 52 },
  { time: "13:30", jobs: 801, high: 465, share: 58 },
  { time: "14:00", jobs: 947, high: 653, share: 69 },
  { time: "14:30", jobs: 1120, high: 874, share: 78 },
  { time: "15:00", jobs: 982, high: 697, share: 71 },
  { time: "15:30", jobs: 806, high: 484, share: 60 },
  { time: "16:00", jobs: 655, high: 321, share: 49 },
  { time: "16:30", jobs: 548, high: 225, share: 41 },
  { time: "17:00", jobs: 497, high: 184, share: 37 },
  { time: "17:30", jobs: 471, high: 165, share: 35 },
  { time: "18:00", jobs: 452, high: 149, share: 33 },
  { time: "18:30", jobs: 438, high: 149, share: 34 },
  { time: "19:00", jobs: 420, high: 134, share: 32 },
  { time: "19:30", jobs: 446, high: 161, share: 36 },
  { time: "20:00", jobs: 431, high: 142, share: 33 },
];
const API_TRAFFIC: MirrorAreaChartDatum[] = [
  { hour: "00", requests: 18400, errors: 42 },
  { hour: "01", requests: 14100, errors: 31 },
  { hour: "02", requests: 11800, errors: 27 },
  { hour: "03", requests: 10200, errors: 88 },
  { hour: "04", requests: 9900, errors: 214 },
  { hour: "05", requests: 12600, errors: 96 },
  { hour: "06", requests: 19800, errors: 38 },
  { hour: "07", requests: 31500, errors: 51 },
  { hour: "08", requests: 44200, errors: 63 },
  { hour: "09", requests: 52700, errors: 70 },
  { hour: "10", requests: 55100, errors: 58 },
  { hour: "11", requests: 53900, errors: 61 },
  { hour: "12", requests: 49800, errors: 55 },
  { hour: "13", requests: 51600, errors: 67 },
  { hour: "14", requests: 54300, errors: 72 },
  { hour: "15", requests: 52200, errors: 140 },
  { hour: "16", requests: 48900, errors: 118 },
  { hour: "17", requests: 43100, errors: 64 },
  { hour: "18", requests: 37800, errors: 49 },
  { hour: "19", requests: 34600, errors: 44 },
  { hour: "20", requests: 32900, errors: 40 },
  { hour: "21", requests: 29700, errors: 36 },
  { hour: "22", requests: 25200, errors: 33 },
  { hour: "23", requests: 21300, errors: 30 },
];
const queueSummary = (datum: MirrorAreaChartDatum) =>
  `${Number(datum.jobs).toLocaleString()} jobs · ${datum.share}% high`;
function MirrorBasicVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Queue load</Frame.Title>
          <Frame.Action>Drag the chart</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <MirrorAreaChart
            data={QUEUE_LOAD}
            xDataKey="time"
            className="px-2 pt-3 pb-4"
          >
            <MirrorAreaChart.Grid />
            <MirrorAreaChart.Area dataKey="jobs" label="jobs" muted />
            <MirrorAreaChart.Area
              dataKey="high"
              label="high priority"
              colorIndex={3}
            />
            <MirrorAreaChart.Area
              dataKey="share"
              label="% high"
              side="bottom"
              colorIndex={3}
              fillOpacity={0.7}
            />
            <MirrorAreaChart.Baseline />
            <MirrorAreaChart.XAxis />
            <MirrorAreaChart.Tooltip
              formatX={(datum) =>
                datum.time === "14:30" ? "14:30 · peak" : String(datum.time)
              }
              formatSummary={queueSummary}
            />
          </MirrorAreaChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function MirrorScalesVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Queue load</Frame.Title>
          <Frame.Action>Today</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <MirrorAreaChart
            data={QUEUE_LOAD}
            xDataKey="time"
            className="px-2 pb-4"
          >
            <MirrorAreaChart.Header
              className={CHART_HEADER}
              title="Peak"
              value="1,120 jobs"
              caption="78% of them high priority, at 14:30"
              legend
            />
            <MirrorAreaChart.Grid />
            <MirrorAreaChart.Area dataKey="jobs" label="Jobs" muted />
            <MirrorAreaChart.Area dataKey="high" label="High" colorIndex={3} />
            <MirrorAreaChart.Area
              dataKey="share"
              label="% high"
              side="bottom"
              colorIndex={2}
              fillOpacity={0.6}
            />
            <MirrorAreaChart.Baseline />
            <MirrorAreaChart.YAxis
              formatBottom={(value) => `${Math.round(value)}%`}
            />
            <MirrorAreaChart.XAxis />
            <MirrorAreaChart.Tooltip
              formatValue={(value, key) =>
                key === "share" ? `${value}%` : value.toLocaleString()
              }
            />
          </MirrorAreaChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function MirrorErrorsVersion() {
  const [active, setActive] = useState(-1);
  const row = active >= 0 ? API_TRAFFIC[active] : null;
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>API</Frame.Title>
          <Frame.Action>Last 24 hours</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <MirrorAreaChart
            data={API_TRAFFIC}
            xDataKey="hour"
            split={0.7}
            onActiveIndexChange={setActive}
            className="px-2 pb-4"
          >
            <MirrorAreaChart.Header
              className={CHART_HEADER}
              title={row ? `${row.hour}:00` : "Requests today"}
              value={row ? Number(row.requests).toLocaleString() : "873,500"}
              caption={row ? `${row.errors} failed` : "1,808 failed, 0.21%"}
            />
            <MirrorAreaChart.Grid variant="lines" />
            <MirrorAreaChart.Area
              dataKey="requests"
              label="requests"
              colorIndex={2}
              gradientToOpacity={0.04}
            />
            <MirrorAreaChart.Area
              dataKey="errors"
              label="failed"
              side="bottom"
              colorIndex={5}
              fillOpacity={0.55}
            />
            <MirrorAreaChart.Baseline />
            <MirrorAreaChart.XAxis
              ticks={3}
              format={(datum) => `${datum.hour}:00`}
            />
            <MirrorAreaChart.Tooltip formatX={(datum) => `${datum.hour}:00`} />
          </MirrorAreaChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
function MirrorLoadingVersion() {
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  useEffect(() => {
    if (status !== "loading") return;
    const timer = setTimeout(() => setStatus("ready"), 900);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <View className="flex-1 justify-center gap-4 p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Queue load</Frame.Title>
          <Frame.Action>
            {status === "loading" ? "Loading" : "Today"}
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <MirrorAreaChart
            data={QUEUE_LOAD}
            xDataKey="time"
            status={status}
            className="px-2 pt-3 pb-4"
          >
            <MirrorAreaChart.Grid />
            <MirrorAreaChart.Skeleton />
            <MirrorAreaChart.Area dataKey="jobs" label="jobs" muted />
            <MirrorAreaChart.Area
              dataKey="high"
              label="high priority"
              colorIndex={3}
            />
            <MirrorAreaChart.Area
              dataKey="share"
              label="% high"
              side="bottom"
              colorIndex={3}
              fillOpacity={0.7}
            />
            <MirrorAreaChart.Baseline />
            <MirrorAreaChart.XAxis />
            <MirrorAreaChart.Tooltip formatSummary={queueSummary} />
          </MirrorAreaChart>
        </Frame.Panel>
      </Frame>
      <Button variant="secondary" onPress={() => setStatus("loading")}>
        Load again
      </Button>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "mirror-area-chart",
  name: "MirrorAreaChart",
  summary:
    "Two readings of one timeline, one above a baseline and one below it",
  layout: "pager",
  demos: [
    {
      label: "Basic",
      id: "basic",
      fullPage: true,
      description:
        "Queued jobs above the line, the high-priority share below it.",
      render: () => <MirrorBasicVersion />,
    },
    {
      label: "Two scales",
      id: "scales",
      fullPage: true,
      description: "Both scales labelled, and every series in the readout.",
      render: () => <MirrorScalesVersion />,
    },
    {
      label: "Errors under traffic",
      id: "errors",
      fullPage: true,
      description:
        "A smaller bottom half, ruled lines, and a header that follows the finger.",
      render: () => <MirrorErrorsVersion />,
    },
    {
      label: "Loading",
      id: "loading",
      fullPage: true,
      description: "A band along the baseline while the data loads.",
      render: () => <MirrorLoadingVersion />,
    },
  ],
};
