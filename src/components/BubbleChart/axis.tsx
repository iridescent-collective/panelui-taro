import { View } from "@tarojs/components";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { ChartAxisText as Text } from "../../primitives/chart-axis-text";
import { useChart } from "./context";
import type { BubbleChartXAxisProps, BubbleChartYAxisProps } from "./types";

export const BubbleChartXAxis = Object.assign(
  ({
    ticks = 4,
    format = compactNumber,
    label,
    className,
  }: BubbleChartXAxisProps) => {
    const { plot, xExtent } = useChart("BubbleChart.XAxis");
    const labels = Array.from({ length: ticks + 1 }, (_, index) => ({
      key: index,
      text: format(xExtent[0] + ((xExtent[1] - xExtent[0]) * index) / ticks),
    }));
    return (
      <View
        className={cn("absolute inset-0", className)}
        style={{ pointerEvents: "none" }}
      >
        {label ? (
          <Text
            size="xs"
            muted
            numberOfLines={1}
            style={{
              bottom: 0,
              left: `${plot.left * 2}rpx`,
              position: "absolute",
              textAlign: "center",
              width: `${plot.width * 2}rpx`,
            }}
          >
            {label}
          </Text>
        ) : null}
        {labels.map((tick) => (
          <Text
            key={tick.key}
            size="xs"
            muted
            numberOfLines={1}
            style={{
              bottom: label ? "36rpx" : 0,
              left: `${Math.max(0, Math.min(plot.left + (plot.width / ticks) * tick.key - 28, plot.left + plot.width + 18 - 56)) * 2}rpx`,
              position: "absolute",
              textAlign: "center",
              width: "112rpx",
            }}
          >
            {tick.text}
          </Text>
        ))}
      </View>
    );
  },
  {
    axis: "x" as const,
    displayName: "BubbleChart.XAxis",
    layer: "overlay" as const,
  }
);
export const BubbleChartYAxis = Object.assign(
  ({
    ticks = 4,
    format = compactNumber,
    label,
    className,
  }: BubbleChartYAxisProps) => {
    const { plot, yExtent } = useChart("BubbleChart.YAxis");
    const labels = Array.from({ length: ticks + 1 }, (_, index) => ({
      key: index,
      text: format(yExtent[1] - ((yExtent[1] - yExtent[0]) * index) / ticks),
    }));
    const titleWidth = label ? 18 : 0;
    return (
      <>
        {label ? (
          <View
            className="absolute"
            style={{
              height: "32rpx",
              left: `${(titleWidth / 2 - plot.height / 2) * 2}rpx`,
              pointerEvents: "none",
              top: `${(plot.top + plot.height / 2 - 8) * 2}rpx`,
              transform: "rotate(-90deg)",
              width: `${plot.height * 2}rpx`,
            }}
          >
            <Text
              size="xs"
              muted
              numberOfLines={1}
              style={{ textAlign: "center" }}
            >
              {label}
            </Text>
          </View>
        ) : null}
        <View
          className={cn(
            "absolute flex flex-col items-end justify-between",
            className
          )}
          style={{
            height: `${(plot.height + 16) * 2}rpx`,
            left: `${titleWidth * 2}rpx`,
            pointerEvents: "none",
            top: `${(plot.top - 8) * 2}rpx`,
            width: `${Math.max(plot.left - 6 - titleWidth, 0) * 2}rpx`,
          }}
        >
          {labels.map((tick) => (
            <Text key={tick.key} size="xs" muted numberOfLines={1}>
              {tick.text}
            </Text>
          ))}
        </View>
      </>
    );
  },
  {
    axis: "y" as const,
    displayName: "BubbleChart.YAxis",
    layer: "overlay" as const,
  }
);
