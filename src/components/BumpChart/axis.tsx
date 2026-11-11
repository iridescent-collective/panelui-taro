import { View } from "@tarojs/components";

import { xOf } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { ChartAxisText as Text } from "../../primitives/chart-axis-text";
import { useChart } from "./context";
import type { BumpChartXAxisProps, BumpChartYAxisProps } from "./types";

export const BumpChartXAxis = Object.assign(
  ({ ticks = 4, format, className }: BumpChartXAxisProps) => {
    const { data, xDataKey, plot, pad } = useChart("BumpChart.XAxis");
    const count = Math.min(ticks, data.length);
    const step = count > 1 ? (data.length - 1) / (count - 1) : 0;
    return (
      <View
        className={cn("absolute inset-0", className)}
        style={{
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: count }, (_, i) => Math.round(i * step)).map(
          (index) => (
            <Text
              key={index}
              size="xs"
              muted
              numberOfLines={1}
              className="absolute text-center"
              style={{
                bottom: 0,
                left: `${Math.max(0, Math.min(xOf(index, data.length, plot) - 28, plot.left + plot.width + pad.right - 56)) * 2}rpx`,
                width: "112rpx",
              }}
            >
              {format
                ? format(data[index], index)
                : String(data[index][xDataKey] ?? "")}
            </Text>
          )
        )}
      </View>
    );
  },
  { displayName: "BumpChart.XAxis", layer: "overlay" as const }
);
export const BumpChartYAxis = Object.assign(
  ({ format, className }: BumpChartYAxisProps) => {
    const { plot, rows } = useChart("BumpChart.YAxis");
    return (
      <View
        className={cn(
          "absolute left-0 flex flex-col items-end",
          rows <= 1 ? "justify-center" : "justify-between",
          className
        )}
        style={{
          height: `${(plot.height + 16) * 2}rpx`,
          pointerEvents: "none",
          top: `${(plot.top - 8) * 2}rpx`,
          width: `${Math.max(plot.left - 8, 0) * 2}rpx`,
        }}
      >
        {Array.from({ length: rows }, (_, i) => (
          <Text key={i} size="xs" muted numberOfLines={1}>
            {format ? format(i + 1) : `#${i + 1}`}
          </Text>
        ))}
      </View>
    );
  },
  {
    axis: "y" as const,
    displayName: "BumpChart.YAxis",
    layer: "overlay" as const,
  }
);
