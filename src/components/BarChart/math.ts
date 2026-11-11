import { barPath } from "../../lib/chart";
import type { Plot } from "../../lib/chart";
import { lineChartPlot } from "../LineChart/math";
import type { BarChartDatum, BarChartOrientation } from "./types";

export const barChartPlot = (
  width: number,
  height: number,
  compact: boolean,
  hasYAxis: boolean,
  orientation: BarChartOrientation
): Plot => {
  if (compact || orientation === "vertical") {
    return lineChartPlot(width, height, compact, hasYAxis);
  }
  return {
    height: Math.max(height - 12, 0),
    left: 68,
    top: 6,
    width: Math.max(width - 78, 0),
  };
};
export const barChartExtent = (
  data: BarChartDatum[],
  keys: string[],
  stacked: boolean,
  yDomain?: [number, number]
): [number, number] => {
  if (yDomain && yDomain.every(Number.isFinite)) {
    return yDomain;
  }
  let min = 0;
  let max = 0;
  for (const row of data) {
    let positive = 0;
    let negative = 0;
    for (const key of keys) {
      const value = row[key];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        continue;
      }
      if (stacked) {
        if (value >= 0) {
          positive += value;
        } else {
          negative += value;
        }
      } else {
        positive = Math.max(positive, value);
        negative = Math.min(negative, value);
      }
    }
    max = Math.max(positive, max);
    min = Math.min(negative, min);
  }
  if (min === 0 && max === 0) {
    return [0, 1];
  }
  return [min === 0 ? 0 : min * 1.1, max === 0 ? 0 : max * 1.1];
};
export interface BarChartPathOptions {
  values: (number | null)[];
  baselines?: number[];
  plot: Plot;
  horizontal: boolean;
  stacked: boolean;
  barGap: number;
  barWidth?: number;
  stackGap: number;
  radius: number;
  minBarLength: number;
  fadedOpacity: number;
  seriesIndex: number;
  seriesCount: number;
  min: number;
  max: number;
  grow: number;
  active: number;
  loading: boolean;
  wantActive: boolean;
}
const barChartFrame = (options: BarChartPathOptions) => {
  const {
    plot,
    horizontal,
    values,
    barGap,
    stacked,
    seriesCount,
    barWidth,
    min,
    max,
    seriesIndex,
  } = options;
  const along = horizontal ? plot.height : plot.width;
  const across = horizontal ? plot.width : plot.height;
  const alongStart = horizontal ? plot.top : plot.left;
  const acrossStart = horizontal ? plot.left : plot.top;
  const band = along / values.length;
  const usable = band * (1 - barGap);
  const slot = stacked ? usable : usable / seriesCount;
  const thickness = Math.min(barWidth ?? slot, slot);
  const range = max - min || 1;
  const project = (value: number) => {
    const fraction = (value - min) / range;
    return horizontal
      ? acrossStart + fraction * across
      : acrossStart + across - fraction * across;
  };
  const offset =
    (stacked ? 0 : seriesIndex * slot) +
    (band - usable) / 2 +
    (slot - thickness) / 2;
  return { alongStart, band, offset, project, thickness };
};
const barChartBandPath = (
  options: BarChartPathOptions,
  frame: ReturnType<typeof barChartFrame>,
  index: number,
  value: number
) => {
  const {
    values,
    baselines,
    grow,
    loading,
    stacked,
    stackGap,
    minBarLength,
    horizontal,
    radius,
  } = options;
  const base = baselines?.[index] ?? 0;
  const start = values.length > 1 ? (index / values.length) * 0.45 : 0;
  const eased = Math.max(0, Math.min(1, (grow - start) / 0.55));
  const shown = loading ? 0 : value * eased;
  const zero = frame.project(base);
  const tip = frame.project(base + shown);
  const shrink = stacked && stackGap > 0 ? stackGap : 0;
  let length = Math.abs(tip - zero) - shrink;
  if (minBarLength > 0 && shown !== 0 && length < minBarLength) {
    length = minBarLength;
  }
  if (length <= 0) {
    return "";
  }
  const lead = frame.alongStart + index * frame.band + frame.offset;
  const positive = shown >= 0;
  if (horizontal) {
    return barPath(
      positive ? zero : zero - length,
      lead,
      length,
      frame.thickness,
      radius,
      positive ? "right" : "left"
    );
  }
  return barPath(
    lead,
    positive ? zero - length : zero,
    frame.thickness,
    length,
    radius,
    positive ? "up" : "down"
  );
};
export const barChartPath = (options: BarChartPathOptions) => {
  const { values, plot, active, wantActive, fadedOpacity } = options;
  if (!values.length || plot.width <= 0) {
    return { d: "", opacity: 1 };
  }
  const frame = barChartFrame(options);
  let d = "";
  for (let index = 0; index < values.length; index += 1) {
    if ((index === active) !== wantActive) {
      continue;
    }
    const value = values[index];
    if (value === null || value === undefined) {
      continue;
    }
    d += barChartBandPath(options, frame, index, value);
  }
  return { d, opacity: !wantActive && active >= 0 ? fadedOpacity : 1 };
};
