import { View } from "@tarojs/components";
import { useContext } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useChart } from "../LineChart/context";
import { LineChartHeader, SeriesSwatch } from "../LineChart/labels";
import { AreaChartStackedContext } from "./root";
import type { AreaChartHeaderProps, AreaChartLegendProps } from "./types";

const useAreaChartSeries = (part: string) => {
  const { series } = useChart(part);
  const stacked = useContext(AreaChartStackedContext);
  return stacked
    ? series.map((_, index) => series[series.length - 1 - index])
    : series;
};
export const AreaChartLegend = Object.assign(
  ({ className, labels, style, ...props }: AreaChartLegendProps) => {
    const ordered = useAreaChartSeries("AreaChart.Legend");
    if (!ordered.length) {
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
        {ordered.map(([key, color]) => (
          <SeriesSwatch key={key} color={color} label={labels?.[key] ?? key} />
        ))}
      </View>
    );
  },
  { displayName: "AreaChart.Legend", layer: "overlay" as const }
);
export const AreaChartHeader = Object.assign(
  ({ legend = false, children, labels, ...props }: AreaChartHeaderProps) => {
    const ordered = useAreaChartSeries("AreaChart.Header");
    const trailing =
      children ??
      (legend && ordered.length ? (
        <View className="flex flex-row flex-wrap items-center justify-end gap-x-[24px] gap-y-[8px]">
          {ordered.map(([key, color]) => (
            <SeriesSwatch
              key={key}
              color={color}
              label={labels?.[key] ?? key}
            />
          ))}
        </View>
      ) : null);
    return <LineChartHeader {...props}>{trailing}</LineChartHeader>;
  },
  { displayName: "AreaChart.Header", layer: "header" as const }
);
