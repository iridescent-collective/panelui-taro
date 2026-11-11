import { xOf, segment } from "../../lib/chart";
import type { Plot, ChartPoint, ChartCurve } from "../../lib/chart";
import type { MirrorAreaChartDatum, MirrorSeries } from "./types";

export const edgeRuns = (
  values: (number | null)[],
  plot: Plot,
  baseline: number,
  height: number,
  max: number,
  grow: number,
  direction: number
): ChartPoint[][] => {
  const runs: ChartPoint[][] = [];
  let run: ChartPoint[] = [];
  const span = max > 0 ? max : 1;
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (value === null || value === undefined) {
      if (run.length) {
        runs.push(run);
      }
      run = [];
      continue;
    }
    const reach = (Math.max(value, 0) / span) * height * grow;
    run.push({
      x: xOf(i, values.length, plot),
      y: baseline + direction * reach,
    });
  }
  if (run.length) {
    runs.push(run);
  }
  return runs;
};
export const edgePath = (runs: ChartPoint[][], curve: ChartCurve): string => {
  let d = "";
  for (const run of runs) {
    d += `${segment(run, curve)} `;
  }
  return d;
};
export const fillPath = (
  runs: ChartPoint[][],
  curve: ChartCurve,
  baseline: number
): string => {
  let d = "";
  for (const run of runs) {
    const edge = segment(run, curve);
    if (!edge) {
      continue;
    }
    const [first] = run;
    const last = run.at(-1);
    if (!last) {
      continue;
    }
    d += `${edge} L${last.x},${baseline} L${first.x},${baseline} Z `;
  }
  return d;
};
export const sideExtent = (
  data: MirrorAreaChartDatum[],
  keys: string[],
  explicit: [number, number] | undefined
): number => {
  if (explicit) {
    return Math.max(explicit[1], 0) || 1;
  }
  let max = 0;
  for (const row of data) {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === "number" && Number.isFinite(value) && value > max) {
        max = value;
      }
    }
  }
  return max > 0 ? max * 1.08 : 1;
};
export const sidesInOrder = (series: MirrorSeries[]): MirrorSeries[] => [
  ...series.filter((item) => item.side === "top"),
  ...series.filter((item) => item.side === "bottom"),
];
