import { View } from "@tarojs/components";
import { useMemo } from "react";

import { bandOf, compactNumber } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { useChart } from "../LineChart/context";
import { ChartAxisText as Text } from "../../primitives/chart-axis-text";
import type {
  CandlestickChartXAxisProps,
  CandlestickChartYAxisProps,
} from "./types";

export const CandlestickChartXAxis = Object.assign(
  ({ ticks, format, className }: CandlestickChartXAxisProps) => {
    const { data, xDataKey, plot } = useChart("CandlestickChart.XAxis");
    const labels = useMemo(() => {
      if (!data.length) {
        return [];
      }
      const room = Math.max(1, Math.floor(plot.width / 68));
      const count = Math.max(1, Math.min(ticks ?? room, data.length));
      const stride = Math.ceil(data.length / count);
      const result: { key: number; text: string; left: number }[] = [];
      for (let index = 0; index < data.length; index += stride) {
        const datum = data[index];
        if (!datum) {
          continue;
        }
        const center = bandOf(index, data.length, plot);
        const x =
          Math.min(
            plot.left + plot.width - 26,
            Math.max(plot.left + 26, center)
          ) - 26;
        result.push({
          key: index,
          left: x,
          text: format ? format(datum, index) : String(datum[xDataKey] ?? ""),
        });
      }
      return result;
    }, [data, xDataKey, plot, ticks, format]);
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
              left: `${label.left * 2}rpx`,
              position: "absolute",
              textAlign: "center",
              width: "104rpx",
            }}
          >
            {label.text}
          </Text>
        ))}
      </View>
    );
  },
  { displayName: "CandlestickChart.XAxis", layer: "overlay" as const }
);
export const CandlestickChartYAxis = Object.assign(
  ({
    ticks = 4,
    format = compactNumber,
    className,
  }: CandlestickChartYAxisProps) => {
    const { plot, extent } = useChart("CandlestickChart.YAxis");
    const labels =
      extent[0] === extent[1]
        ? []
        : Array.from({ length: ticks + 1 }, (_, index) => ({
            key: index,
            text: format(extent[1] - ((extent[1] - extent[0]) * index) / ticks),
          }));
    return (
      <View
        className={cn("absolute flex flex-col justify-between", className)}
        style={{
          height: `${(plot.height + 16) * 2}rpx`,
          left: 0,
          pointerEvents: "none",
          top: `${(plot.top - 8) * 2}rpx`,
          width: "84rpx",
        }}
      >
        {labels.map((label) => (
          <Text
            key={label.key}
            size="xs"
            muted
            numberOfLines={1}
            className="text-right"
          >
            {label.text}
          </Text>
        ))}
      </View>
    );
  },
  {
    axis: "y" as const,
    displayName: "CandlestickChart.YAxis",
    layer: "overlay" as const,
  }
);
