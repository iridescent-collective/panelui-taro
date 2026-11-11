import { View } from "@tarojs/components";
import { useMemo } from "react";

import { cn } from "../../lib/utils";
import { useAxisLabelScale } from "../../primitives/chart-axis-text";
import { ChartAxisText as Text } from "../../primitives/chart-axis-text";
import {
  DEFAULT_AXIS_WIDTH,
  DAYS_IN_WEEK,
  MONTHS,
  WEEKDAYS,
} from "./constants";
import { useHeatmap } from "./context";
import type { HeatmapXAxisProps, HeatmapYAxisProps } from "./types";

export const HeatmapXAxis = Object.assign(
  ({ className, formatLabel, labels: given }: HeatmapXAxisProps) => {
    const { data, grid } = useHeatmap("HeatmapChart.XAxis");
    const scale = useAxisLabelScale();
    const step = grid.size + grid.gap;
    const labels = useMemo(() => {
      if (given) {
        return given
          .slice(0, data.length)
          .map((label, column) => ({ column, label }))
          .filter((entry) => entry.label);
      }
      const out: { column: number; label: string }[] = [];
      let lastMonth = -1;
      for (const [index, column] of data.entries()) {
        const date = column.bins.find((bin) => bin.date)?.date;
        if (!date) {
          continue;
        }
        const month = date.getMonth();
        if (month === lastMonth) {
          continue;
        }
        lastMonth = month;
        const label = formatLabel ? formatLabel(date, index) : MONTHS[month];
        if (label) {
          out.push({ column: index, label });
        }
      }
      if (out.length > 1 && out[1].column - out[0].column < 3) {
        out.shift();
      }
      return out;
    }, [data, formatLabel, given]);
    return (
      <View
        className={cn("relative h-[32px]", className)}
        style={{ width: `${grid.width * 2}rpx`, height: `${Math.ceil(16 * scale) * 2}rpx` }}
      >
        {labels.map(({ column, label }) => (
          <Text
            key={`${column}-${label}`}
            size="xs"
            muted
            className="absolute"
            style={{ left: `${column * step * 2}rpx` }}
          >
            {label}
          </Text>
        ))}
      </View>
    );
  },
  { displayName: "HeatmapChart.XAxis", slot: "x-axis" as const }
);
export const HeatmapYAxis = Object.assign(
  ({
    className,
    width: givenWidth,
    tickFilter = "odd",
    labelFormat = "full",
    labels,
  }: HeatmapYAxisProps) => {
    const { grid, weekStartDay } = useHeatmap("HeatmapChart.YAxis");
    const scale = useAxisLabelScale();
    const width = givenWidth ?? Math.ceil(DEFAULT_AXIS_WIDTH * scale);
    const step = grid.size + grid.gap;
    return (
      <View
        className={cn("relative shrink-0", className)}
        style={{ height: `${grid.height * 2}rpx`, width: `${width * 2}rpx` }}
      >
        {Array.from({ length: grid.rows }, (_, row) => {
          if (tickFilter === "odd" && row % 2 === 0) {
            return null;
          }
          if (tickFilter === "even" && row % 2 === 1) {
            return null;
          }
          const name = labels
            ? (labels[row] ?? "")
            : WEEKDAYS[(row + weekStartDay) % DAYS_IN_WEEK];
          let caption = name;
          if (!labels) {
            caption =
              labelFormat === "initial" ? name.slice(0, 1) : name.slice(0, 3);
          }
          return (
            <Text
              key={row}
              size="xs"
              muted
              numberOfLines={1}
              className="absolute"
              style={{ top: `${(row * step + grid.size / 2 - 7 * scale) * 2}rpx` }}
            >
              {caption}
            </Text>
          );
        })}
      </View>
    );
  },
  { displayName: "HeatmapChart.YAxis", slot: "y-axis" as const }
);
