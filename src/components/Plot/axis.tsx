import { View } from "@tarojs/components";
import { useMemo } from "react";

import { compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { ChartAxisText as Text } from "../../primitives/chart-axis-text";
import {
  AXIS_LABEL_HEIGHT,
  PADDING,
  POINT_LABEL_WIDTH,
  Y_AXIS_GUTTER,
} from "./constants";
import { usePlot } from "./context";
import { pointX } from "./math";
import type { PlotDatum, PlotXAxisProps, PlotYAxisProps } from "./types";

export const plotXLabels = (
  data: PlotDatum[],
  xDataKey: string,
  ticks: number,
  format?: PlotXAxisProps["format"]
) => {
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
};
export const plotYLabels = (
  extent: [number, number],
  ticks: number,
  format?: PlotYAxisProps["format"]
) => {
  const [min, max] = extent;
  if (min === 0 && max === 0) {
    return [];
  }
  const count = Number.isFinite(ticks) ? Math.max(1, Math.floor(ticks)) : 4;
  return Array.from({ length: count + 1 }, (_, key) => {
    const value = max - ((max - min) * key) / count;
    return { key, text: format ? format(value) : compactNumber(value) };
  });
};
export const PlotXAxis = Object.assign(
  ({ ticks = 4, format, className }: PlotXAxisProps) => {
    const { data, xDataKey, plot, xScale } = usePlot("Plot.XAxis");
    const labels = useMemo(
      () => plotXLabels(data, xDataKey, ticks, format),
      [data, ticks, format, xDataKey]
    );
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
              left: `${Math.max(0, Math.min(pointX(label.key, data.length, plot, xScale) - POINT_LABEL_WIDTH / 2, plot.left + plot.width + PADDING.right - POINT_LABEL_WIDTH)) * 2}rpx`,
              position: "absolute",
              textAlign: "center",
              width: `${POINT_LABEL_WIDTH * 2}rpx`,
            }}
          >
            {label.text}
          </Text>
        ))}
      </View>
    );
  },
  { displayName: "Plot.XAxis", layer: "overlay" as const }
);
export const PlotYAxis = Object.assign(
  ({ ticks = 4, format, className }: PlotYAxisProps) => {
    const { plot, extent } = usePlot("Plot.YAxis");
    const labels = useMemo(
      () => plotYLabels(extent, ticks, format),
      [extent, ticks, format]
    );
    return (
      <View
        style={{
          height: `${(plot.height + AXIS_LABEL_HEIGHT) * 2}rpx`,
          left: "0",
          pointerEvents: "none",
          position: "absolute",
          top: `${(plot.top - AXIS_LABEL_HEIGHT / 2) * 2}rpx`,
          width: `${Math.max(plot.left - Y_AXIS_GUTTER, 0) * 2}rpx`,
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
    displayName: "Plot.YAxis",
    layer: "overlay" as const,
  }
);
