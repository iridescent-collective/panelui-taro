import type { Plot as PlotBox } from "../../lib/chart";
import { bandOf, barPath, xOf, yOf } from "../../lib/chart";
import { PADDING, Y_AXIS_WIDTH } from "./constants";
import type { PlotBound, PlotDatum } from "./types";

export const finiteChartNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;
export const niceDomain = (
  min: number,
  max: number,
  ticks = 5
): [number, number] => {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    return [min, max];
  }
  const rough = (max - min) / Math.max(1, ticks);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const error = rough / magnitude;
  let factor = 1;
  if (error >= Math.sqrt(50)) {
    factor = 10;
  } else if (error >= Math.sqrt(10)) {
    factor = 5;
  } else if (error >= Math.sqrt(2)) {
    factor = 2;
  }
  const step = factor * magnitude;
  return [Math.floor(min / step) * step, Math.ceil(max / step) * step];
};
export const xAt = (
  value: number,
  plot: PlotBox,
  min: number,
  max: number
): number => {
  const span = max - min || 1;
  return plot.left + ((value - min) / span) * plot.width;
};
const dataRange = (
  data: PlotDatum[],
  seriesKeys: string[]
): [number, number] => {
  let min = Infinity;
  let max = -Infinity;
  for (const row of data) {
    for (const key of seriesKeys) {
      const value = finiteChartNumber(row[key]);
      if (value === undefined) {
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
  return [min, max];
};
export const plotExtent = (
  data: PlotDatum[],
  seriesKeys: string[],
  yDomain: [PlotBound, PlotBound] | undefined,
  hasBars: boolean,
  nice: boolean
): [number, number] => {
  const lowPin = finiteChartNumber(yDomain?.[0]);
  const highPin = finiteChartNumber(yDomain?.[1]);
  if (lowPin !== undefined && highPin !== undefined) {
    return [lowPin, highPin];
  }
  let [min, max] = dataRange(data, seriesKeys);
  if (min === Infinity) {
    const low = lowPin ?? 0;
    const high = highPin ?? low + 1;
    return [low, high];
  }
  let lowRoom = 1;
  let highRoom = 1;
  if (hasBars) {
    if (min > 0) {
      min = 0;
    }
    if (max < 0) {
      max = 0;
    }
    if (min === 0) {
      lowRoom = 0;
    }
    if (max === 0) {
      highRoom = 0;
    }
  }
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const headroom = (max - min) * 0.1;
  const [niceLow, niceHigh] = nice ? niceDomain(min, max) : [min, max];
  const derivedLow = nice ? niceLow : min - headroom * lowRoom;
  const derivedHigh = nice ? niceHigh : max + headroom * highRoom;
  return [lowPin ?? derivedLow, highPin ?? derivedHigh];
};
export const plotForSize = (
  width: number,
  height: number,
  compact: boolean,
  hasYAxis: boolean
) => {
  const pad = compact
    ? { bottom: 2, left: 1, right: 1, top: 2 }
    : { ...PADDING, left: hasYAxis ? Y_AXIS_WIDTH : PADDING.left };
  return {
    height: Math.max(height - pad.top - pad.bottom, 0),
    left: pad.left,
    top: pad.top,
    width: Math.max(width - pad.left - pad.right, 0),
  };
};
export const plotCursorIndex = (
  x: number,
  total: number,
  plot: PlotBox,
  banded: boolean
) => {
  if (total < 1 || plot.width <= 0) {
    return -1;
  }
  const ratio = (x - plot.left) / plot.width;
  const clamped = Math.min(1, Math.max(0, ratio));
  return banded
    ? Math.min(total - 1, Math.floor(clamped * total))
    : Math.round(clamped * Math.max(total - 1, 0));
};
export const plotBarsPath = (
  values: (number | null)[],
  plot: PlotBox,
  min: number,
  max: number,
  gap: number,
  radius: number,
  baseline: number
) => {
  const total = values.length;
  const slice = total > 0 ? plot.width / total : 0;
  const width = Math.max(1, slice * (1 - Math.min(Math.max(gap, 0), 0.95)));
  if (max === min || plot.width <= 0 || !total) {
    return "";
  }
  const base = yOf(Math.min(Math.max(baseline, min), max), plot, min, max);
  let path = "";
  for (let index = 0; index < total; index += 1) {
    const value = values[index];
    if (value === null || value === undefined) {
      continue;
    }
    const y = yOf(value, plot, min, max);
    const top = Math.min(y, base);
    const height = Math.abs(base - y);
    if (height <= 0) {
      continue;
    }
    path += barPath(
      bandOf(index, total, plot) - width / 2,
      top,
      width,
      height,
      radius,
      y <= base ? "up" : "down"
    );
  }
  return path;
};
export const pointX = (
  index: number,
  total: number,
  plot: PlotBox,
  scale: "point" | "band"
) => (scale === "band" ? bandOf(index, total, plot) : xOf(index, total, plot));
