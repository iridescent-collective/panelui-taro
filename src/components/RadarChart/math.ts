import type { RadarChartDatum } from "./types";

export type RadarValues = (number | null)[];
export const radarExtent = (
  data: RadarChartDatum[],
  keys: string[],
  domain?: [number, number]
): [number, number] => {
  if (domain && domain.every(Number.isFinite)) {
    return domain;
  }
  let max = -Infinity;
  for (const row of data) {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === "number" && Number.isFinite(value) && value > max) {
        max = value;
      }
    }
  }
  return max === -Infinity ? [0, 1] : [0, max === 0 ? 1 : max * 1.05];
};
export const radarValues = (
  data: RadarChartDatum[],
  key: string
): RadarValues =>
  data.map((row) =>
    typeof row[key] === "number" && Number.isFinite(row[key]) ? row[key] : null
  );
export const morphOrigins = (
  previous: RadarValues,
  current: RadarValues,
  t: number
): RadarValues =>
  current.map((value, index) => {
    const start = previous[index];
    if (value === null || start === null || start === undefined) {
      return value ?? start ?? null;
    }
    return start + (value - start) * t;
  });
export const scaledRadarValues = (
  start: RadarValues,
  target: RadarValues,
  morph: number,
  min: number,
  max: number,
  reveal: number
): RadarValues => {
  const span = Math.max(max - min, 1e-6);
  return target.map((value, index) => {
    const a = start[index] ?? value;
    const b = value ?? a;
    if (a === null || a === undefined || b === null || b === undefined) {
      return null;
    }
    return ((a + (b - a) * morph - min) / span) * reveal;
  });
};
