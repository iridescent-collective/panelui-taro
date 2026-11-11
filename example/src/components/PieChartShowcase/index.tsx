import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { PieChart } from "panelui-taro/pie-chart";
import type { PieChartHandle } from "panelui-taro/pie-chart";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

const DATA = [
  { label: "Reading", value: 20 },
  { label: "Practice", value: 30 },
  { label: "Walking", value: 50 },
];
export const PieChartShowcase = () => {
  const ref = useRef<PieChartHandle>(null);
  const [active, setActive] = useState(-1);
  const [donut, setDonut] = useState(true);
  const [rounded, setRounded] = useState(false);
  const [partial, setPartial] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography
        id="panel-pie-result"
        className="block w-full max-w-full min-w-0 break-all whitespace-normal"
      >
        {JSON.stringify({ active, donut, loading, partial, rounded })}
      </Typography>
      <PieChart
        ref={ref}
        data={DATA}
        size={240}
        innerRadius={donut ? 0.65 : 0}
        padAngle={rounded ? 4 : 0}
        minAngle={rounded ? 12 : 0}
        startAngle={partial ? -90 : 0}
        endAngle={partial ? 90 : 360}
        status={loading ? "loading" : "ready"}
        onActiveIndexChange={setActive}
        className="rounded-[32px] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] p-[32px]"
      >
        <PieChart.Header
          title="Today’s activity"
          value="100 min"
          caption="A share of the whole"
        />
        <PieChart.Slices cornerRadius={rounded ? 8 : 0} />
        <PieChart.Skeleton />
        <PieChart.Center />
        <PieChart.Legend />
      </PieChart>
      <Button
        id="panel-pie-hole"
        variant="outline"
        onPress={() => setDonut((value) => !value)}
      >
        {donut ? "Solid pie" : "Donut"}
      </Button>
      <Button
        id="panel-pie-corners"
        variant="outline"
        onPress={() => setRounded((value) => !value)}
      >
        {rounded ? "Sharp slices" : "Rounded slices"}
      </Button>
      <Button
        id="panel-pie-span"
        variant="outline"
        onPress={() => setPartial((value) => !value)}
      >
        {partial ? "Full circle" : "Half dial"}
      </Button>
      <Button
        id="panel-pie-loading"
        variant="outline"
        onPress={() => setLoading((value) => !value)}
      >
        {loading ? "Show data" : "Loading skeleton"}
      </Button>
      <Button
        id="panel-pie-replay"
        variant="outline"
        onPress={() => ref.current?.replay()}
      >
        Replay unroll
      </Button>
    </View>
  );
};
