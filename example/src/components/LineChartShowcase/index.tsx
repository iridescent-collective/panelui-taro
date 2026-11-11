import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { LineChart } from "panelui-taro/line-chart";
import type {
  LineChartCurve,
  LineChartDatum,
  LineChartHandle,
} from "panelui-taro/line-chart";
import { Typography } from "panelui-taro/typography";
import { useMemo, useRef, useState } from "react";

const DATA: LineChartDatum[] = [
  { date: "Mon", practice: 14, reading: 24 },
  { date: "Tue", practice: 28, reading: 36 },
  { date: "Wed", practice: 34, reading: 30 },
  { date: "Thu", practice: 26, reading: null },
  { date: "Fri", practice: 44, reading: 52 },
  { date: "Sat", practice: 38, reading: 42 },
  { date: "Sun", practice: 54, reading: 64 },
];
const LABELS = { practice: "Practice", reading: "Reading" };
export const LineChartShowcase = () => {
  const ref = useRef<LineChartHandle>(null);
  const [active, setActive] = useState(-1);
  const [lastSelected, setLastSelected] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [curve, setCurve] = useState<LineChartCurve>("monotone");
  const [expanded, setExpanded] = useState(false);
  const [axis, setAxis] = useState(true);
  const data = useMemo(
    () =>
      expanded
        ? DATA.map((datum) => ({
            ...datum,
            practice: Number(datum.practice) * 2,
          }))
        : DATA,
    [expanded]
  );
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography
        id="panel-line-chart-result"
        className="block w-full max-w-full min-w-0 break-all whitespace-normal"
      >
        {JSON.stringify({
          active,
          axis,
          curve,
          expanded,
          lastSelected,
          loading,
        })}
      </Typography>
      <LineChart
        ref={ref}
        id="panel-line-chart-root"
        data={data}
        status={loading ? "loading" : "ready"}
        curve={curve}
        onActiveIndexChange={(index) => {
          setActive(index);
          if (index >= 0) {
            setLastSelected(index);
          }
        }}
        className="rounded-[32px] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] p-[32px]"
      >
        <LineChart.Header
          title="Weekly learning"
          value="64 min"
          caption="Daily activity"
          labels={LABELS}
        />
        <LineChart.Grid />
        <LineChart.Area dataKey="reading" />
        <LineChart.Line dataKey="reading" showMarkers />
        <LineChart.Line dataKey="practice" colorIndex={2} dashArray="4,6" />
        <LineChart.Skeleton />
        {axis ? <LineChart.YAxis /> : null}
        <LineChart.XAxis />
        <LineChart.Tooltip formatValue={(value) => `${value} min`} />
      </LineChart>
      <Button
        id="panel-line-chart-replay"
        variant="outline"
        onPress={() => ref.current?.replay()}
      >
        Replay reveal
      </Button>
      <Button
        id="panel-line-chart-loading"
        variant="outline"
        onPress={() => setLoading((value) => !value)}
      >
        {loading ? "Show data" : "Loading state"}
      </Button>
      <Button
        id="panel-line-chart-domain"
        variant="outline"
        onPress={() => setExpanded((value) => !value)}
      >
        Update domain
      </Button>
      <Button
        id="panel-line-chart-curve"
        variant="outline"
        onPress={() =>
          setCurve((value) => (value === "linear" ? "monotone" : "linear"))
        }
      >
        Curve: {curve}
      </Button>
      <Button
        id="panel-line-chart-axis"
        variant="outline"
        onPress={() => setAxis((value) => !value)}
      >
        {axis ? "Hide Y axis" : "Show Y axis"}
      </Button>
    </View>
  );
};
