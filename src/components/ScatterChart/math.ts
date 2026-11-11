import type { Plot } from "../../lib/chart";
import { projectBubble, landing } from "../BubbleChart/math";
import type { ScatterChartDatum, ScatterChartPoint } from "./types";

const padExtent = (min: number, max: number): [number, number] => {
  if (min === Infinity) {
    return [0, 1];
  }
  if (min === max) {
    return [min - 1, max + 1];
  }
  const pad = (max - min) * 0.08;
  return [min - pad, max + pad];
};
export const radiusFor = (
  value: string | number | null | undefined,
  extent: [number, number] | null,
  range: [number, number],
  fallback: number
): number => {
  if (!extent || typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  const [min, max] = extent;
  const [rMin, rMax] = range;
  const ratio = max === min ? 1 : (value - min) / (max - min);
  const area = rMin * rMin + ratio * (rMax * rMax - rMin * rMin);
  return Math.sqrt(area);
};
export const scatterExtents = (
  data: ScatterChartDatum[],
  xDataKey: string,
  series: string[],
  xDomain?: [number, number],
  yDomain?: [number, number]
): { x: [number, number]; y: [number, number] } => {
  const seriesKeys = series.join("|");
  return (() => {
    const keys = seriesKeys ? seriesKeys.split("|") : [];
    let lowX = Infinity;
    let highX = -Infinity;
    let lowY = Infinity;
    let highY = -Infinity;
    for (const row of data) {
      const x = row[xDataKey];
      if (typeof x !== "number" || Number.isNaN(x)) {
        continue;
      }
      for (const key of keys) {
        const y = row[key];
        if (typeof y !== "number" || Number.isNaN(y)) {
          continue;
        }
        if (x < lowX) {
          lowX = x;
        }
        if (x > highX) {
          highX = x;
        }
        if (y < lowY) {
          lowY = y;
        }
        if (y > highY) {
          highY = y;
        }
      }
    }
    return {
      x: xDomain ?? padExtent(lowX, highX),
      y: yDomain ?? padExtent(lowY, highY),
    };
  })();
};
export const scatterPoints = (
  data: ScatterChartDatum[],
  xDataKey: string,
  dataKey: string,
  sizeKey: string | undefined,
  sizeRange: [number, number],
  size: number,
  sizeExtent: [number, number] | null
) =>
  data.flatMap((datum, index) => {
    const x = datum[xDataKey];
    const y = datum[dataKey];
    if (
      typeof x !== "number" ||
      Number.isNaN(x) ||
      typeof y !== "number" ||
      Number.isNaN(y)
    ) {
      return [];
    }
    return [
      {
        dataKey,
        datum,
        index,
        r: radiusFor(datum[sizeKey ?? ""], sizeExtent, sizeRange, size),
        x,
        y,
      },
    ];
  });
export const scatterCircleFrame = (input: {
  x: number;
  y: number;
  r: number;
  plot: Plot;
  xExtent: readonly [number, number];
  yExtent: readonly [number, number];
  opacity: number;
  total: number;
  order: number;
  grow: number;
  selection: number;
}) => {
  const start = input.total > 1 ? (input.order / input.total) * 0.4 : 0;
  const arrived = Math.max(0, Math.min(1, (input.grow - start) / 0.6));
  const center = projectBubble(input, input.plot, input.xExtent, input.yExtent);
  return {
    cx: center.x,
    cy: center.y,
    fillOpacity:
      Math.min(1, arrived * 2) *
      (input.opacity + (1 - input.opacity) * input.selection),
    r: input.r * landing(arrived) * (1 + 0.5 * input.selection),
  };
};
export const scatterHit = (
  data: ScatterChartDatum[],
  keys: string[],
  xDataKey: string,
  plot: Plot,
  xExtent: [number, number],
  yExtent: [number, number],
  x: number,
  y: number,
  radius: number
): ScatterChartPoint | null => {
  let winner: ScatterChartPoint | null = null;
  let best = radius * radius;
  for (const dataKey of keys) {
    for (const [index, datum] of data.entries()) {
      const px = datum[xDataKey];
      const py = datum[dataKey];
      if (
        typeof px !== "number" ||
        Number.isNaN(px) ||
        typeof py !== "number" ||
        Number.isNaN(py)
      ) {
        continue;
      }
      const point = { dataKey, datum, index, x: px, y: py };
      const center = projectBubble(point, plot, xExtent, yExtent);
      const distance = (center.x - x) ** 2 + (center.y - y) ** 2;
      if (distance <= best) {
        winner = point;
        best = distance;
      }
    }
  }
  return winner;
};
