import { View } from "@tarojs/components";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { ChartAxisText as Text } from "../../primitives/chart-axis-text";
import { useChart } from "./context";
import type { LiveLineChartXAxisProps, LiveLineChartYAxisProps } from "./types";

export const LiveLineChartXAxis = Object.assign(
  ({ ticks = 4, formatTick, className }: LiveLineChartXAxisProps) => {
    const { plot, windowMs, status } = useChart("LiveLineChart.XAxis");
    if (status === "loading" || ticks < 1) {
      return null;
    }
    const format =
      formatTick ??
      ((seconds: number) =>
        seconds <= 0 ? "now" : `-${Math.round(seconds)}s`);
    return (
      <View className="absolute inset-0" style={{ pointerEvents: "none" }}>
        {Array.from({ length: ticks + 1 }, (_, i) => (
          <View
            key={i}
            className={cn("absolute flex flex-col items-center", className)}
            style={{
              left: `${(plot.left + (plot.width * i) / ticks - 28) * 2}rpx`,
              top: `${(plot.top + plot.height + 4) * 2}rpx`,
              width: "112rpx",
            }}
          >
            <Text size="xs" muted numberOfLines={1}>
              {format((windowMs / 1000) * (1 - i / ticks))}
            </Text>
          </View>
        ))}
      </View>
    );
  },
  { displayName: "LiveLineChart.XAxis", layer: "overlay" as const }
);
export const LiveLineChartYAxis = Object.assign(
  ({
    ticks = 4,
    formatValue = compactNumber,
    className,
  }: LiveLineChartYAxisProps) => {
    const { plot, extent, status } = useChart("LiveLineChart.YAxis");
    if (status === "loading" || ticks < 1) {
      return null;
    }
    return (
      <View className="absolute inset-0" style={{ pointerEvents: "none" }}>
        {Array.from({ length: ticks + 1 }, (_, i) => (
          <View
            key={i}
            className={cn("absolute left-0 flex flex-col items-end", className)}
            style={{
              top: `${(plot.top + (plot.height * i) / ticks - 8) * 2}rpx`,
              width: `${(plot.left - 6) * 2}rpx`,
            }}
          >
            <Text size="xs" muted numberOfLines={1}>
              {formatValue(extent[1] - ((extent[1] - extent[0]) * i) / ticks)}
            </Text>
          </View>
        ))}
      </View>
    );
  },
  {
    axis: "y" as const,
    displayName: "LiveLineChart.YAxis",
    layer: "overlay" as const,
  }
);
