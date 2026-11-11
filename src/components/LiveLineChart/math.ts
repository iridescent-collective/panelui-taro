import { yOf } from "../../lib/chart";
import type { Plot, ChartPoint } from "../../lib/chart";

export const xAt = (time: number, plot: Plot, min: number, max: number) =>
  plot.left + ((time - min) / (max - min || 1)) * plot.width;
export const runOf = (
  times: number[],
  values: number[],
  plot: Plot,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number
): ChartPoint[] => {
  const out: ChartPoint[] = [];
  const count = times.length;
  if (!count) {
    return out;
  }
  let start = 0;
  for (let i = 0; i < count; i += 1) {
    if (times[i] >= xMin) {
      break;
    }
    start = i;
  }
  for (let i = start; i < count; i += 1) {
    const time = times[i];
    if (time > xMax) {
      break;
    }
    out.push({
      x: xAt(time, plot, xMin, xMax),
      y: yOf(values[i], plot, yMin, yMax),
    });
  }
  return out;
};
