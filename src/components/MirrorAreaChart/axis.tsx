import { View } from "@tarojs/components";

import { compactNumber, xOf } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { ChartAxisText as Text } from "../../primitives/chart-axis-text";
import { useChart } from "./context";
import type {
  MirrorAreaChartXAxisProps,
  MirrorAreaChartYAxisProps,
} from "./types";

export const MirrorAreaChartXAxis = Object.assign(
  ({ ticks = 4, format, className }: MirrorAreaChartXAxisProps) => {
    const { data, xDataKey, plot, pad } = useChart("MirrorAreaChart.XAxis");
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
  { displayName: "MirrorAreaChart.XAxis", layer: "overlay" as const }
);
export const MirrorAreaChartYAxis = Object.assign(
  ({
    formatTop = compactNumber,
    formatBottom = compactNumber,
    className,
  }: MirrorAreaChartYAxisProps) => {
    const { plot, baseline, topExtent, bottomExtent } = useChart(
      "MirrorAreaChart.YAxis"
    );
    const labels = [
      { key: "top", text: formatTop(topExtent), y: plot.top },
      { key: "zero", text: "0", y: baseline },
      {
        key: "bottom",
        text: formatBottom(bottomExtent),
        y: plot.top + plot.height,
      },
    ];
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
            className="absolute left-0 text-right"
            style={{
              top: `${(label.y - 8) * 2}rpx`,
              width: `${Math.max(plot.left - 6, 0) * 2}rpx`,
            }}
          >
            {label.text}
          </Text>
        ))}
      </View>
    );
  },
  {
    axis: "y" as const,
    displayName: "MirrorAreaChart.YAxis",
    layer: "overlay" as const,
  }
);
