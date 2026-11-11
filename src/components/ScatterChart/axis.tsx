import { View } from "@tarojs/components";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { ChartAxisText as Text } from "../../primitives/chart-axis-text";
import { useChart } from "./context";
import type { ScatterChartXAxisProps, ScatterChartYAxisProps } from "./types";

export const ScatterChartXAxis = Object.assign(
  ({
    ticks = 4,
    format = compactNumber,
    className,
  }: ScatterChartXAxisProps) => {
    const { plot, xExtent } = useChart("ScatterChart.XAxis");
    const labels = Array.from({ length: ticks + 1 }, (_, index) => ({
      key: index,
      text: format(xExtent[0] + ((xExtent[1] - xExtent[0]) * index) / ticks),
    }));
    return (
      <View
        className={cn("absolute inset-0", className)}
        style={{ pointerEvents: "none" }}
      >
        {labels.map((label) => (
          <Text
            key={label.key}
            size="xs"
            muted
            numberOfLines={1}
            style={{
              bottom: 0,
              left: `${Math.max(0, Math.min(plot.left + (plot.width / ticks) * label.key - 28, plot.left + plot.width + 14 - 56)) * 2}rpx`,
              position: "absolute",
              textAlign: "center",
              width: "112rpx",
            }}
          >
            {label.text}
          </Text>
        ))}
      </View>
    );
  },
  { displayName: "ScatterChart.XAxis", layer: "overlay" as const }
);
export const ScatterChartYAxis = Object.assign(
  ({
    ticks = 4,
    format = compactNumber,
    className,
  }: ScatterChartYAxisProps) => {
    const { plot, yExtent } = useChart("ScatterChart.YAxis");
    const labels = Array.from({ length: ticks + 1 }, (_, index) => ({
      key: index,
      text: format(yExtent[1] - ((yExtent[1] - yExtent[0]) * index) / ticks),
    }));
    return (
      <View
        className={cn(
          "absolute flex flex-col items-end justify-between",
          className
        )}
        style={{
          height: `${(plot.height + 16) * 2}rpx`,
          left: 0,
          pointerEvents: "none",
          top: `${(plot.top - 8) * 2}rpx`,
          width: `${Math.max(plot.left - 6, 0) * 2}rpx`,
        }}
      >
        {labels.map((label) => (
          <Text key={label.key} size="xs" muted numberOfLines={1}>
            {label.text}
          </Text>
        ))}
      </View>
    );
  },
  {
    axis: "y" as const,
    displayName: "ScatterChart.YAxis",
    layer: "overlay" as const,
  }
);
