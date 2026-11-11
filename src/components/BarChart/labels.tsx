import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useChart } from "../LineChart/context";
import { SeriesSwatch } from "../LineChart/labels";
import type { BarChartLegendProps } from "./types";

export const BarChartLegend = Object.assign(
  ({ className, labels, style, ...props }: BarChartLegendProps) => {
    const { series } = useChart("BarChart.Legend");
    if (!series.length) {
      return null;
    }
    return (
      <View
        {...props}
        style={mergeStyle({ pointerEvents: "none" }, style)}
        className={cn(
          "absolute top-[8px] right-[16px] flex flex-row gap-[24px]",
          className
        )}
      >
        {series.map(([key, color]) => (
          <SeriesSwatch key={key} color={color} label={labels?.[key] ?? key} />
        ))}
      </View>
    );
  },
  { displayName: "BarChart.Legend", layer: "overlay" as const }
);
