import { View } from "@tarojs/components";
import { useMemo } from "react";

import { compactNumber, xOf } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { ChartAxisText as Text } from "../../primitives/chart-axis-text";
import {
  LINE_CHART_AXIS_LABEL_HEIGHT,
  LINE_CHART_PADDING,
  LINE_CHART_POINT_LABEL_WIDTH,
  LINE_CHART_Y_AXIS_GUTTER,
} from "./constants";
import { useChart } from "./context";
import type { LineChartXAxisProps, LineChartYAxisProps } from "./types";

export const LineChartXAxis = Object.assign(
  ({ ticks = 4, format, className }: LineChartXAxisProps) => {
    const { data, xDataKey, plot } = useChart("LineChart.XAxis");
    const labels = useMemo(() => {
      if (!data.length) {
        return [];
      }
      const count = Math.min(
        Number.isFinite(ticks) ? Math.max(0, Math.floor(ticks)) : 4,
        data.length
      );
      const step = count > 1 ? (data.length - 1) / (count - 1) : 0;
      return Array.from({ length: count }, (_, index) => {
        const key = Math.round(index * step);
        const datum = data[key];
        return {
          key,
          text: format ? format(datum, key) : String(datum[xDataKey] ?? ""),
        };
      });
    }, [data, ticks, format, xDataKey]);
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
              bottom: "0",
              left: `${Math.max(0, Math.min(xOf(label.key, data.length, plot) - LINE_CHART_POINT_LABEL_WIDTH / 2, plot.left + plot.width + LINE_CHART_PADDING.right - LINE_CHART_POINT_LABEL_WIDTH)) * 2}rpx`,
              position: "absolute",
              textAlign: "center",
              width: `${LINE_CHART_POINT_LABEL_WIDTH * 2}rpx`,
            }}
          >
            {label.text}
          </Text>
        ))}
      </View>
    );
  },
  { displayName: "LineChart.XAxis", layer: "overlay" as const }
);
export const LineChartYAxis = Object.assign(
  ({ ticks = 4, format, className }: LineChartYAxisProps) => {
    const { plot, extent } = useChart("LineChart.YAxis");
    const labels = useMemo(() => {
      const [min, max] = extent;
      if (min === 0 && max === 0) {
        return [];
      }
      const count = Number.isFinite(ticks) ? Math.max(1, Math.floor(ticks)) : 4;
      return Array.from({ length: count + 1 }, (_, key) => {
        const value = max - ((max - min) * key) / count;
        return { key, text: format ? format(value) : compactNumber(value) };
      });
    }, [extent, ticks, format]);
    return (
      <View
        style={{
          height: `${(plot.height + LINE_CHART_AXIS_LABEL_HEIGHT) * 2}rpx`,
          left: "0",
          pointerEvents: "none",
          position: "absolute",
          top: `${(plot.top - LINE_CHART_AXIS_LABEL_HEIGHT / 2) * 2}rpx`,
          width: `${Math.max(plot.left - LINE_CHART_Y_AXIS_GUTTER, 0) * 2}rpx`,
        }}
        className={cn("flex flex-col items-end justify-between", className)}
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
    displayName: "LineChart.YAxis",
    layer: "overlay" as const,
  }
);
