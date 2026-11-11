import { View } from "@tarojs/components";
import { useMemo } from "react";

import { bandOf, compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { useChart } from "../LineChart/context";
import { ChartAxisText as Text } from "../../primitives/chart-axis-text";
import { useBarChartSettings } from "./root";
import type { BarChartXAxisProps, BarChartYAxisProps } from "./types";

const MIN_BAND_LABEL = 34;
const AXIS_LABEL_HEIGHT = 16;
export const BarChartXAxis = Object.assign(
  ({ ticks, format, className }: BarChartXAxisProps) => {
    const { data, xDataKey, plot } = useChart("BarChart.XAxis");
    const { orientation } = useBarChartSettings();
    const labels = useMemo(() => {
      if (!data.length) {
        return [];
      }
      const room = Math.max(1, Math.floor(plot.width / MIN_BAND_LABEL));
      const requested =
        ticks === undefined || !Number.isFinite(ticks) ? room : ticks;
      const count = Math.max(1, Math.min(requested, data.length));
      const stride = Math.ceil(data.length / count);
      const picked: { key: number; text: string }[] = [];
      for (let index = 0; index < data.length; index += stride) {
        const datum = data[index];
        if (datum) {
          picked.push({
            key: index,
            text: format ? format(datum, index) : String(datum[xDataKey] ?? ""),
          });
        }
      }
      return picked;
    }, [data, ticks, format, xDataKey, plot.width]);
    if (orientation === "horizontal") {
      return null;
    }
    const bandWidth = data.length > 0 ? plot.width / data.length : 0;
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
              left: `${(bandOf(label.key, data.length, plot) - bandWidth / 2) * 2}rpx`,
              position: "absolute",
              textAlign: "center",
              width: `${bandWidth * 2}rpx`,
            }}
          >
            {label.text}
          </Text>
        ))}
      </View>
    );
  },
  { displayName: "BarChart.XAxis", layer: "overlay" as const }
);
export const BarChartYAxis = Object.assign(
  ({ ticks = 4, format, className }: BarChartYAxisProps) => {
    const { plot, data, xDataKey, extent } = useChart("BarChart.YAxis");
    const { orientation } = useBarChartSettings();
    const horizontal = orientation === "horizontal";
    const labels = useMemo(() => {
      if (horizontal) {
        return data.map((row, index) => ({
          key: index,
          text: String(row[xDataKey] ?? ""),
        }));
      }
      const [min, max] = extent;
      if (min === 0 && max === 0) {
        return [];
      }
      const count = Number.isFinite(ticks) ? Math.max(1, Math.floor(ticks)) : 4;
      return Array.from({ length: count + 1 }, (_, index) => {
        const value = max - ((max - min) * index) / count;
        return {
          key: index,
          text: format ? format(value) : compactNumber(value),
        };
      });
    }, [extent, ticks, format, horizontal, data, xDataKey]);
    return (
      <View
        style={{
          height: `${(horizontal ? plot.height : plot.height + AXIS_LABEL_HEIGHT) * 2}rpx`,
          left: "0",
          pointerEvents: "none",
          position: "absolute",
          top: `${(horizontal ? plot.top : plot.top - AXIS_LABEL_HEIGHT / 2) * 2}rpx`,
          ...(horizontal
            ? { width: `${Math.max(plot.left - 8, 0) * 2}rpx` }
            : {}),
        }}
        className={cn(
          "flex flex-col",
          horizontal ? "items-end" : "justify-between",
          className
        )}
      >
        {labels.map((label) => (
          <View
            key={label.key}
            className={
              horizontal ? "flex flex-1 flex-col justify-center" : undefined
            }
          >
            <Text size="xs" muted numberOfLines={1}>
              {label.text}
            </Text>
          </View>
        ))}
      </View>
    );
  },
  {
    axis: "y" as const,
    displayName: "BarChart.YAxis",
    layer: "overlay" as const,
  }
);
