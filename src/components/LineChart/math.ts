import type { Plot } from "../../lib/chart";
import {
  LINE_CHART_COMPACT_PADDING,
  LINE_CHART_PADDING,
  LINE_CHART_Y_AXIS_WIDTH,
} from "./constants";
import type { LineChartDatum } from "./types";

export const lineChartPlot = (
  width: number,
  height: number,
  compact: boolean,
  hasYAxis: boolean
): Plot => {
  const padding = compact
    ? LINE_CHART_COMPACT_PADDING
    : {
        ...LINE_CHART_PADDING,
        left: hasYAxis ? LINE_CHART_Y_AXIS_WIDTH : LINE_CHART_PADDING.left,
      };
  return {
    height: Math.max(height - padding.top - padding.bottom, 0),
    left: padding.left,
    top: padding.top,
    width: Math.max(width - padding.left - padding.right, 0),
  };
};
export const lineChartExtent = (
  data: LineChartDatum[],
  keys: readonly string[],
  explicit?: [number, number]
): [number, number] => {
  if (explicit && explicit.every(Number.isFinite)) {
    return explicit;
  }
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const row of data) {
    for (const key of keys) {
      const value = row[key];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        continue;
      }
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
    }
  }
  if (min === Number.POSITIVE_INFINITY) {
    return [0, 1];
  }
  if (min === max) {
    return [min - 1, max + 1];
  }
  const padding = (max - min) * 0.1;
  return [min - padding, max + padding];
};
export const lineChartIndexAt = (x: number, total: number, plot: Plot) => {
  if (total < 2 || plot.width <= 0) {
    return -1;
  }
  return Math.round(
    Math.min(1, Math.max(0, (x - plot.left) / plot.width)) * (total - 1)
  );
};
