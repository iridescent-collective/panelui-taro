import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Plot } from "panelui-taro/plot";
import type { PlotHandle } from "panelui-taro/plot";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

import { PLOT_DATA } from "./constants";
import { GuideMark } from "./guide-mark";

export const PlotShowcase = () => {
  const ref = useRef<PlotHandle>(null);
  const [mode, setMode] = useState("line");
  const [active, setActive] = useState("None");
  const [lastInspected, setLastInspected] = useState("None");
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Paragraph>
        Plot · Compose marks and inspect data
      </Typography.Paragraph>
      <Plot
        data={PLOT_DATA}
        ref={ref}
        nice
        onActiveIndexChange={(_, datum) => {
          const label = String(datum?.label ?? "None");
          setActive(label);
          if (datum) {
            setLastInspected(label);
          }
        }}
      >
        <Plot.Header
          title="Weekly visits"
          value="126"
          caption="Drag to inspect each day"
        />
        <Plot.Legend labels={{ total: "Total", visits: "Visits" }} />
        <Plot.Grid />
        {mode === "line" ? (
          <Plot.Area dataKey="visits" />
        ) : (
          <Plot.Bars dataKey="visits" />
        )}
        <Plot.Line dataKey="total" colorIndex={2} />
        <Plot.Dots dataKey="total" colorIndex={2} />
        <Plot.XAxis />
        <Plot.YAxis />
        <Plot.Rule y={30} dashed label="Target" />
        <Plot.Layer>
          <GuideMark />
        </Plot.Layer>
        <Plot.Overlay>
          <View className="absolute top-[16px] right-[20px] rounded-full bg-[var(--panel-muted)] px-[12px] py-[4px]">
            <Typography.Paragraph>Target 30</Typography.Paragraph>
          </View>
        </Plot.Overlay>
        <Plot.Cursor />
        <Plot.Tooltip />
      </Plot>
      <Typography.Paragraph>Active: {active}</Typography.Paragraph>
      <Typography.Paragraph>
        Last inspected: {lastInspected}
      </Typography.Paragraph>
      <View className="flex flex-row gap-[16px]">
        <Button onPress={() => setMode(mode === "line" ? "bars" : "line")}>
          {mode === "line" ? "Show bars" : "Show area"}
        </Button>
        <Button variant="primary" onPress={() => ref.current?.replay()}>
          Replay
        </Button>
      </View>
    </View>
  );
};
