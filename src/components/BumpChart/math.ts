import { xOf } from "../../lib/chart";
import type { Plot } from "../../lib/chart";
import { sortCopy } from "../../lib/sort-copy";
import type { BumpChartDatum, BumpRanks } from "./types";

const finiteChartNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

interface ChartPoint {
  x: number;
  y: number;
}
export const bumpRanks = (
  data: BumpChartDatum[],
  keys: string[],
  options: {
    values?: "rank" | "score";
  } = {}
): BumpRanks => {
  const ranks: BumpRanks = {};
  for (const key of keys) {
    ranks[key] = [];
  }
  for (const row of data) {
    if (options.values === "score") {
      const scored = sortCopy(
        keys
          .map((key, order) => ({
            key,
            order,
            score: finiteChartNumber(row[key]),
          }))
          .filter(
            (
              entry
            ): entry is {
              key: string;
              order: number;
              score: number;
            } => entry.score !== undefined
          ),
        (a, b) => b.score - a.score || a.order - b.order
      );
      const place = new Map(
        scored.map((entry, index) => [entry.key, index + 1])
      );
      for (const key of keys) {
        ranks[key].push(place.get(key) ?? null);
      }
    } else {
      for (const key of keys) {
        const rank = finiteChartNumber(row[key]);
        ranks[key].push(rank !== undefined && rank >= 1 ? rank : null);
      }
    }
  }
  return ranks;
};
export const rankFractions = (ranks: BumpRanks, rows: number): BumpRanks => {
  const out: BumpRanks = {};
  for (const key of Object.keys(ranks)) {
    out[key] = ranks[key].map((rank) => {
      if (rank === null) {
        return null;
      }
      return rows <= 1 ? 0.5 : (rank - 1) / (rows - 1);
    });
  }
  return out;
};
export const pointsAt = (
  key: string,
  from: BumpRanks,
  to: BumpRanks,
  progress: number,
  plot: Plot
): ChartPoint[][] => {
  const target = to[key];
  if (!target) {
    return [];
  }
  const origin = from[key];
  const runs: ChartPoint[][] = [];
  let run: ChartPoint[] = [];
  for (let i = 0; i < target.length; i += 1) {
    const end = target[i];
    if (end === null || end === undefined) {
      if (run.length) {
        runs.push(run);
      }
      run = [];
      continue;
    }
    const start = origin?.[i];
    const fraction =
      start === null || start === undefined
        ? end
        : start + (end - start) * progress;
    run.push({
      x: xOf(i, target.length, plot),
      y: plot.top + fraction * plot.height,
    });
  }
  if (run.length) {
    runs.push(run);
  }
  return runs;
};
const clamp = (alpha: number) =>
  Number.isFinite(alpha) ? Math.min(Math.max(alpha, 0), 1) : 1;
const HEX_ALPHA = /^#(?:[0-9a-f]{4}|[0-9a-f]{8})$/iu;
const RGBA_ALPHA =
  /^rgba?\(\s*[\d.]+[\s,]+[\d.]+[\s,]+[\d.]+\s*[,/]\s*[\d.]+%?\s*\)$/iu;
export const colorStop = (
  color: string
): {
  stopColor: string;
  stopOpacity: number;
} => {
  const value = color.trim();

  if (HEX_ALPHA.test(value)) {
    const body =
      value.length === 5
        ? Array.from(value.slice(1), (digit) => digit + digit).join("")
        : value.slice(1);
    return {
      stopColor: `#${body.slice(0, 6)}`,
      stopOpacity: clamp(Number.parseInt(body.slice(6, 8), 16) / 255),
    };
  }
  if (RGBA_ALPHA.test(value)) {
    const [red, green, blue, raw] = value.match(/[\d.]+%?/gu) ?? [];
    const alpha = raw.endsWith("%")
      ? Number(raw.slice(0, -1)) / 100
      : Number(raw);
    return {
      stopColor: `rgb(${red}, ${green}, ${blue})`,
      stopOpacity: clamp(alpha),
    };
  }
  return { stopColor: value, stopOpacity: 1 };
};
export const bumpSegment = (points: ChartPoint[]): string => {
  if (!points.length) {
    return "";
  }
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const from = points[i - 1];
    const to = points[i];
    const mid = (from.x + to.x) / 2;
    d += ` C${mid},${from.y} ${mid},${to.y} ${to.x},${to.y}`;
  }
  return d;
};
export const dotsPath = (points: ChartPoint[], radius: number): string => {
  let d = "";
  for (const point of points) {
    d += `M${point.x - radius},${point.y} a${radius},${radius} 0 1,0 ${radius * 2},0 a${radius},${radius} 0 1,0 ${-radius * 2},0 `;
  }
  return d;
};
