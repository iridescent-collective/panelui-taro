import type { Plot } from "../../lib/chart";
import type { BubbleChartDatum, ResolvedBubble } from "./types";

const AXIS_STEPS = 4;
const PALETTE_SIZE = 5;
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
  let multiple = 1;
  if (error >= Math.sqrt(50)) {
    multiple = 10;
  } else if (error >= Math.sqrt(10)) {
    multiple = 5;
  } else if (error >= Math.sqrt(2)) {
    multiple = 2;
  }
  const step = multiple * magnitude;
  return [Math.floor(min / step) * step, Math.ceil(max / step) * step];
};
export const bubbleRadius = (
  value: number,
  extent: readonly [number, number],
  range: readonly [number, number]
): number => {
  const [min, max] = extent;
  const [rMin, rMax] = range;
  const ratio = max === min ? 1 : (value - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, ratio));
  const area = rMin * rMin + clamped * (rMax * rMax - rMin * rMin);
  return Math.sqrt(area);
};
const padExtent = (min: number, max: number): [number, number] => {
  if (min === Infinity) {
    return [0, 1];
  }
  if (min === max) {
    return [min - 1, max + 1];
  }
  return niceDomain(min, max, AXIS_STEPS);
};
export const bubbleExtents = (
  data: BubbleChartDatum[],
  xDataKey: string,
  yDataKey: string,
  xDomain?: [number, number],
  yDomain?: [number, number]
): { x: [number, number]; y: [number, number] } => {
  let lowX = Infinity;
  let highX = -Infinity;
  let lowY = Infinity;
  let highY = -Infinity;
  for (const row of data) {
    const x = row[xDataKey];
    const y = row[yDataKey];
    if (typeof x !== "number" || Number.isNaN(x)) {
      continue;
    }
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
  return {
    x: xDomain ?? padExtent(lowX, highX),
    y: yDomain ?? padExtent(lowY, highY),
  };
};
export const bubbleSizeExtent = (
  data: BubbleChartDatum[],
  sizeKey?: string
): [number, number] | null => {
  if (!sizeKey) {
    return null;
  }
  let min = Infinity;
  let max = -Infinity;
  for (const row of data) {
    const value = row[sizeKey];
    if (typeof value !== "number" || Number.isNaN(value)) {
      continue;
    }
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
  }
  return min === Infinity ? null : [min, max];
};
export const resolveBubbles = (
  data: BubbleChartDatum[],
  xDataKey: string,
  yDataKey: string,
  sizeKey: string | undefined,
  labelKey: string | undefined,
  colorKey: string | undefined,
  sizeExtent: [number, number] | null,
  sizeRange: [number, number],
  palette: string[]
): ResolvedBubble[] => {
  const middle = (sizeRange[0] + sizeRange[1]) / 2;
  const out: ResolvedBubble[] = [];
  for (const [index, datum] of data.entries()) {
    const x = datum[xDataKey];
    const y = datum[yDataKey];
    if (typeof x !== "number" || Number.isNaN(x)) {
      continue;
    }
    if (typeof y !== "number" || Number.isNaN(y)) {
      continue;
    }
    const raw = sizeKey ? datum[sizeKey] : undefined;
    const value = typeof raw === "number" && !Number.isNaN(raw) ? raw : null;
    const r =
      sizeExtent && value !== null
        ? bubbleRadius(value, sizeExtent, sizeRange)
        : middle;
    const explicit = colorKey ? datum[colorKey] : undefined;
    let color = palette[index % PALETTE_SIZE] ?? palette[0] ?? "";
    if (typeof explicit === "string") {
      color = explicit;
    } else if (typeof explicit === "number") {
      color =
        palette[(Math.round(explicit) - 1 + PALETTE_SIZE) % PALETTE_SIZE] ??
        palette[0] ??
        "";
    }
    out.push({
      color,
      datum,
      index,
      label: labelKey ? String(datum[labelKey] ?? "") : "",
      r,
      size: value,
      x,
      y,
    });
  }
  return out;
};
export const bubbleFit = (bubbles: ResolvedBubble[]) => {
  const n = bubbles.length;
  if (n < 2) {
    return null;
  }
  let sumX = 0;
  let sumY = 0;
  for (const bubble of bubbles) {
    sumX += bubble.x;
    sumY += bubble.y;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const bubble of bubbles) {
    const dx = bubble.x - meanX;
    const dy = bubble.y - meanY;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0) {
    return null;
  }
  const slope = sxy / sxx;
  const denominator = Math.sqrt(sxx * syy);
  return {
    intercept: meanY - slope * meanX,
    r: denominator === 0 ? 0 : Math.abs(sxy / denominator),
    slope,
  };
};
export const landing = (t: number): number => {
  const back = 1.3;
  const u = t - 1;
  return 1 + (back + 1) * u * u * u + back * u * u;
};
export const projectBubble = (
  point: { x: number; y: number },
  plot: Plot,
  xExtent: readonly [number, number],
  yExtent: readonly [number, number]
) => ({
  x:
    plot.left +
    ((point.x - xExtent[0]) / (xExtent[1] - xExtent[0] || 1)) * plot.width,
  y:
    plot.top +
    plot.height -
    ((point.y - yExtent[0]) / (yExtent[1] - yExtent[0] || 1)) * plot.height,
});
export const bubbleHit = (
  bubbles: ResolvedBubble[],
  plot: Plot,
  xExtent: readonly [number, number],
  yExtent: readonly [number, number],
  x: number,
  y: number,
  hitRadius: number
) => {
  let winner: ResolvedBubble | null = null;
  let best = Infinity;
  for (const bubble of bubbles) {
    const center = projectBubble(bubble, plot, xExtent, yExtent);
    const distance = (center.x - x) ** 2 + (center.y - y) ** 2;
    const reach = Math.max(bubble.r, hitRadius);
    if (distance <= reach * reach && distance < best) {
      best = distance;
      winner = bubble;
    }
  }
  return winner;
};

export const bubbleTooltipPosition = (
  active: ResolvedBubble | null,
  plot: Plot,
  xExtent: readonly [number, number],
  yExtent: readonly [number, number],
  tall: number
) => {
  const center = active
    ? projectBubble(active, plot, xExtent, yExtent)
    : { x: 0, y: 0 };
  const radius = active?.r ?? 0;
  const above = center.y - radius - 10 - tall;
  return {
    x:
      Math.min(
        plot.left + plot.width - 66,
        Math.max(plot.left + 66, center.x)
      ) - 66,
    y: above >= plot.top ? above : center.y + radius + 10,
  };
};
export interface BubbleCircleOptions {
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
}
export const bubbleCircleFrame = (input: BubbleCircleOptions) => {
  const start = input.total > 1 ? (input.order / input.total) * 0.4 : 0;
  const arrived = Math.max(0, Math.min(1, (input.grow - start) / 0.6));
  const center = projectBubble(input, input.plot, input.xExtent, input.yExtent);
  return {
    cx: center.x,
    cy: center.y,
    fillOpacity:
      Math.min(1, arrived * 2) *
      (input.opacity + (1 - input.opacity) * input.selection),
    r: input.r * landing(arrived) * (1 + 0.12 * input.selection),
  };
};
