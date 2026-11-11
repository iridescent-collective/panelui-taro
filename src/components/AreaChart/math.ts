import type { AreaChartDatum } from "./types";

export const areaChartExtent = (
  data: AreaChartDatum[],
  keys: string[],
  stacked: boolean,
  yDomain?: [number, number]
): [number, number] => {
  if (yDomain && yDomain.every(Number.isFinite)) {
    return yDomain;
  }
  let min = Infinity;
  let max = -Infinity;
  for (const row of data) {
    let rowTotal = 0;
    for (const key of keys) {
      const value = row[key];
      if (typeof value !== "number" || !Number.isFinite(value)) {
        continue;
      }
      if (stacked) {
        rowTotal += value;
      } else {
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
    if (stacked) {
      min = Math.min(min, rowTotal);
      max = Math.max(max, rowTotal);
    }
  }
  if (min === Infinity) {
    return [0, 1];
  }
  if (min === max) {
    return [min - 1, max + 1];
  }
  const floor = min >= 0 ? 0 : min - (max - min) * 0.1;
  return [floor, max + (max - min) * 0.1];
};
export const areaChartBaselines = (
  data: AreaChartDatum[],
  series: [string, string][],
  dataKey: string,
  stacked: boolean
): number[] | undefined => {
  if (!stacked) {
    return undefined;
  }
  const below = series.slice(
    0,
    series.findIndex(([key]) => key === dataKey)
  );
  if (!below.length) {
    return undefined;
  }
  return data.map((row) => {
    let total = 0;
    for (const [key] of below) {
      const value = row[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        total += value;
      }
    }
    return total;
  });
};
