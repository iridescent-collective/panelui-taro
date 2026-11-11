import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { PolarAreaChart } from "panelui-taro/polar-area-chart";
import type { PolarAreaChartHandle } from "panelui-taro/polar-area-chart";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

const DATA = [
  { label: "Reading", value: 90 },
  { label: "Writing", value: 70 },
  { label: "Numbers", value: 45 },
  { label: "Music", value: 110 },
  { label: "Science", value: 55 },
  { label: "Exercise", value: 147 },
];
export const PolarAreaChartShowcase = () => {
  const ref = useRef<PolarAreaChartHandle>(null);
  const [active, setActive] = useState(-1);
  const [area, setArea] = useState(false);
  const [rounded, setRounded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fixed, setFixed] = useState(false);
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography
        id="panel-polar-result"
        className="block w-full max-w-full min-w-0 break-all whitespace-normal"
      >
        {JSON.stringify({ active, area, fixed, loading, rounded })}
      </Typography>
      <PolarAreaChart
        ref={ref}
        data={DATA}
        size={240}
        scale={area ? "area" : "radius"}
        maxValue={fixed ? 200 : undefined}
        padAngle={rounded ? 4 : 0}
        status={loading ? "loading" : "ready"}
        onActiveIndexChange={setActive}
        className="rounded-[32px] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] p-[32px]"
      >
        <PolarAreaChart.Header
          title="Independent scores"
          value={fixed ? "Scale 200" : "Scale 150"}
          caption="Equal angles, individual readings"
        />
        <PolarAreaChart.Grid spokes />
        <PolarAreaChart.Wedges cornerRadius={rounded ? 6 : 0} />
        <PolarAreaChart.Labels />
        <PolarAreaChart.Tooltip />
        <PolarAreaChart.Legend />
        <PolarAreaChart.Skeleton />
      </PolarAreaChart>
      <Button
        id="panel-polar-scale"
        variant="outline"
        onPress={() => setArea((value) => !value)}
      >
        {area ? "Radius carries value" : "Area carries value"}
      </Button>
      <Button
        id="panel-polar-max"
        variant="outline"
        onPress={() => setFixed((value) => !value)}
      >
        {fixed ? "Derive nice maximum" : "Fix maximum to 200"}
      </Button>
      <Button
        id="panel-polar-corners"
        variant="outline"
        onPress={() => setRounded((value) => !value)}
      >
        {rounded ? "Sharp wedges" : "Rounded wedges"}
      </Button>
      <Button
        id="panel-polar-loading"
        variant="outline"
        onPress={() => setLoading((value) => !value)}
      >
        {loading ? "Show scores" : "Loading disc"}
      </Button>
      <Button
        id="panel-polar-replay"
        variant="outline"
        onPress={() => ref.current?.replay()}
      >
        Replay growth
      </Button>
    </View>
  );
};
