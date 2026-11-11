import { compactNumber, barPath } from "../../lib/chart";
import type { Plot } from "../../lib/chart";
import type { WaterfallDatum, WaterfallStep, WaterfallKind } from "./types";

interface Bands {
  along: number;
  across: number;
  alongStart: number;
  acrossStart: number;
  band: number;
  thickness: number;
}
const finiteChartNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;
const finiteChartDomain = (
  domain: readonly [number, number] | undefined
): [number, number] | undefined =>
  domain && domain.every(Number.isFinite) ? [domain[0], domain[1]] : undefined;
export const waterfallSteps = (data: WaterfallDatum[]): WaterfallStep[] => {
  const steps: WaterfallStep[] = [];
  let running = 0;
  for (const datum of data) {
    const value = finiteChartNumber(datum.value) ?? 0;
    if (datum.total) {
      running += value;
      steps.push({
        datum,
        end: running,
        kind: "total",
        label: datum.label,
        start: 0,
        value: running,
      });
      continue;
    }
    const start = running;
    running += value;
    steps.push({
      datum,
      end: running,
      kind: value < 0 ? "fall" : "rise",
      label: datum.label,
      start,
      value,
    });
  }
  return steps;
};
export const bandsOf = (
  plot: Plot,
  total: number,
  horizontal: boolean,
  barGap: number,
  barWidth: number | undefined
): Bands => {
  const along = horizontal ? plot.height : plot.width;
  const across = horizontal ? plot.width : plot.height;
  const band = along / Math.max(1, total);
  const usable = band * (1 - barGap);
  return {
    across,
    acrossStart: horizontal ? plot.left : plot.top,
    along,
    alongStart: horizontal ? plot.top : plot.left,
    band,
    thickness: Math.min(barWidth ?? usable, usable),
  };
};
export const waterfallExtent = (
  steps: WaterfallStep[],
  yDomain?: [number, number]
): [number, number] =>
  (() => {
    const explicit = finiteChartDomain(yDomain);
    if (explicit) {
      return explicit;
    }
    let min = 0;
    let max = 0;
    for (const step of steps) {
      const low = Math.min(step.start, step.end);
      const high = Math.max(step.start, step.end);
      if (low < min) {
        min = low;
      }
      if (high > max) {
        max = high;
      }
    }
    if (min === 0 && max === 0) {
      return [0, 1];
    }
    return [min === 0 ? 0 : min * 1.1, max === 0 ? 0 : max * 1.1];
  })();
export interface WaterfallPathOptions {
  steps: WaterfallStep[];
  plot: Plot;
  horizontal: boolean;
  barGap: number;
  barWidth?: number;
  radius: number;
  minBarLength: number;
  fadedOpacity: number;
  loading: boolean;
  min: number;
  max: number;
  grow: number;
  active: number;
}
const minimumLength = (
  length: number,
  minimum: number,
  eased: number,
  loading: boolean
) =>
  minimum > 0 && eased > 0 && !loading && length < minimum ? minimum : length;
export const waterfallBarPath = (
  options: WaterfallPathOptions,
  kind: WaterfallKind,
  wantActive: boolean
) => {
  const {
    steps,
    plot,
    horizontal,
    barGap,
    barWidth,
    radius,
    minBarLength,
    fadedOpacity,
    loading,
  } = options;
  const total = steps.length;
  const { min, max, grow, active } = options;
  if (!total || plot.width <= 0) {
    return { d: "", opacity: 1 };
  }
  const bands = bandsOf(plot, total, horizontal, barGap, barWidth);

  const range = max - min || 1;

  const project = (value: number) => {
    const fraction = (value - min) / range;
    return horizontal
      ? bands.acrossStart + fraction * bands.across
      : bands.acrossStart + bands.across - fraction * bands.across;
  };
  let d = "";
  for (let i = 0; i < total; i += 1) {
    const step = steps[i];
    if (!step || step.kind !== kind) {
      continue;
    }
    if ((i === active) !== wantActive) {
      continue;
    }
    const startAt = total > 1 ? (i / total) * 0.45 : 0;
    const eased = Math.max(0, Math.min(1, (grow - startAt) / 0.55));
    const reached = loading
      ? step.start
      : step.start + (step.end - step.start) * eased;
    const from = project(step.start);
    const to = project(reached);
    let length = Math.abs(to - from);
    length = minimumLength(length, minBarLength, eased, loading);
    if (length <= 0) {
      continue;
    }
    const lead =
      bands.alongStart + i * bands.band + (bands.band - bands.thickness) / 2;
    const forward = reached >= step.start;
    d += horizontal
      ? barPath(
          forward ? from : from - length,
          lead,
          length,
          bands.thickness,
          radius,
          forward ? "right" : "left"
        )
      : barPath(
          lead,
          forward ? from - length : from,
          bands.thickness,
          length,
          radius,
          forward ? "up" : "down"
        );
  }
  const dim = !wantActive && active >= 0 ? fadedOpacity : 1;
  return { d, opacity: dim };
};

export const waterfallConnectorPath = (options: WaterfallPathOptions) => {
  const { steps, plot, horizontal, barGap, barWidth, loading } = options;
  const total = steps.length;
  const { min, max, grow } = options;
  if (total < 2 || plot.width <= 0 || loading) {
    return { d: "" };
  }
  const bands = bandsOf(plot, total, horizontal, barGap, barWidth);

  const range = max - min || 1;

  const project = (value: number) => {
    const fraction = (value - min) / range;
    return horizontal
      ? bands.acrossStart + fraction * bands.across
      : bands.acrossStart + bands.across - fraction * bands.across;
  };
  let d = "";
  for (let i = 0; i < total - 1; i += 1) {
    const step = steps[i];
    if (!step) {
      continue;
    }
    const startAt = total > 1 ? (i / total) * 0.45 : 0;
    const eased = Math.max(0, Math.min(1, (grow - startAt) / 0.55));
    if (eased <= 0) {
      continue;
    }
    const level = project(step.end);
    const from =
      bands.alongStart + i * bands.band + (bands.band - bands.thickness) / 2;
    const to =
      bands.alongStart +
      (i + 2) * bands.band -
      (bands.band - bands.thickness) / 2;
    const reach = from + (to - from) * eased;
    d += horizontal
      ? `M${level},${from}L${level},${reach}`
      : `M${from},${level}L${reach},${level}`;
  }
  return { d };
};

export const waterfallSignedValue = (step: WaterfallStep) =>
  step.kind === "total"
    ? compactNumber(step.value)
    : `${step.value > 0 ? "+" : ""}${compactNumber(step.value)}`;
