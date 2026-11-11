import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useChart } from "../LineChart/context";
import { SeriesSwatch } from "../LineChart/labels";
import type { PyramidChartLegendProps } from "./types";

export const PyramidChartLegend = Object.assign(
  ({ className, labels, style, ...props }: PyramidChartLegendProps) => {
    const { series } = useChart("PyramidChart.Legend");
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
  { displayName: "PyramidChart.Legend", layer: "overlay" as const }
);
