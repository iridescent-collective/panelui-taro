import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { RadarChart } from "panelui-taro/radar-chart";
import type { RadarChartHandle } from "panelui-taro/radar-chart";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

const DATA = [
  { axis: "Reading", team: 60, you: 80 },
  { axis: "Writing", team: 70, you: 50 },
  { axis: "Numbers", team: 60, you: 90 },
  { axis: "Music", team: 30, you: 70 },
  { axis: "Science", team: 75, you: 55 },
];
const NEXT = DATA.map((row, index) => ({ ...row, you: 30 + index * 12 }));
export const RadarChartShowcase = () => {
  const ref = useRef<RadarChartHandle>(null);
  const [changed, setChanged] = useState(false);
  const [circular, setCircular] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compact, setCompact] = useState(false);
  const [selected, setSelected] = useState(-1);
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography id="panel-radar-result">
        {JSON.stringify({ changed, circular, compact, loading, selected })}
      </Typography>
      <RadarChart
        ref={ref}
        data={changed ? NEXT : DATA}
        domain={[0, 100]}
        compact={compact}
        status={loading ? "loading" : "ready"}
        onAccessibilityDatumPress={(_datum, index) => setSelected(index)}
        className="rounded-[32px] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] p-[32px]"
      >
        <RadarChart.Header
          title="Learning profile"
          value="Two profiles"
          caption="Same axes, same scale"
          legend
        />
        <RadarChart.Grid circular={circular} />
        {compact ? null : <RadarChart.Axis />}
        <RadarChart.Series dataKey="you" showDots />
        <RadarChart.Series dataKey="team" colorIndex={2} fillOpacity={0} />
        <RadarChart.Legend
          formatName={(key) => (key === "you" ? "You" : "Team")}
        />
      </RadarChart>
      <Button
        id="panel-radar-data"
        variant="outline"
        onPress={() => setChanged((value) => !value)}
      >
        {changed ? "Original profile" : "Switch profile"}
      </Button>
      <Button
        id="panel-radar-grid"
        variant="outline"
        onPress={() => setCircular((value) => !value)}
      >
        {circular ? "Polygon grid" : "Circular grid"}
      </Button>
      <Button
        id="panel-radar-compact"
        variant="outline"
        onPress={() => setCompact((value) => !value)}
      >
        {compact ? "Show axis labels" : "Compact profile"}
      </Button>
      <Button
        id="panel-radar-loading"
        variant="outline"
        onPress={() => setLoading((value) => !value)}
      >
        {loading ? "Restore profiles" : "Loading profiles"}
      </Button>
      <Button
        id="panel-radar-replay"
        variant="outline"
        onPress={() => ref.current?.replay()}
      >
        Replay growth
      </Button>
    </View>
  );
};
