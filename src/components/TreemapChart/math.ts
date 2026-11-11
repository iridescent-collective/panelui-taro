import { sortCopy } from "../../lib/sort-copy";
import type { TreemapDatum, TreemapRect, TreemapTile } from "./types";

const TARGET_RATIO = (1 + Math.sqrt(5)) / 2;
const FADE = 0.45;
const diceRow = (
  values: number[],
  from: number,
  to: number,
  sum: number,
  out: TreemapRect[],
  x0: number,
  y0: number,
  x1: number,
  y1: number
) => {
  const scale = sum ? (x1 - x0) / sum : 0;
  let x = x0;
  for (let i = from; i < to; i += 1) {
    const width = values[i] * scale;
    out[i] = { height: y1 - y0, width, x, y: y0 };
    x += width;
  }
};
const sliceRow = (
  values: number[],
  from: number,
  to: number,
  sum: number,
  out: TreemapRect[],
  x0: number,
  y0: number,
  x1: number,
  y1: number
) => {
  const scale = sum ? (y1 - y0) / sum : 0;
  let y = y0;
  for (let i = from; i < to; i += 1) {
    const height = values[i] * scale;
    out[i] = { height, width: x1 - x0, x: x0, y };
    y += height;
  }
};
const completeRects = (
  out: TreemapRect[],
  count: number,
  x: number,
  y: number
) => {
  for (let i = 0; i < count; i += 1) {
    if (!out[i]) {
      out[i] = { height: 0, width: 0, x, y };
    }
  }
  return out;
};
export const squarifyLayout = (
  values: number[],
  width: number,
  height: number,
  ratio: number = TARGET_RATIO
): TreemapRect[] => {
  const count = values.length;
  const out: TreemapRect[] = [];
  if (!count || width <= 0 || height <= 0) {
    return [];
  }
  let remaining = 0;
  for (let i = 0; i < count; i += 1) {
    remaining += values[i];
  }
  if (remaining <= 0) {
    return [];
  }
  let x0 = 0;
  let y0 = 0;
  const x1 = width;
  const y1 = height;
  let start = 0;
  let end = 0;
  while (start < count) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    if (dx <= 0 || dy <= 0) {
      break;
    }
    let sum = 0;
    do {
      sum = values[end];
      end += 1;
    } while (!sum && end < count);
    let smallest = sum;
    let largest = sum;
    const alpha = Math.max(dy / dx, dx / dy) / (remaining * ratio);
    let beta = sum * sum * alpha;
    let worst = Math.max(largest / beta, beta / smallest);
    for (; end < count; end += 1) {
      const value = values[end];
      sum += value;
      if (value < smallest) {
        smallest = value;
      }
      if (value > largest) {
        largest = value;
      }
      beta = sum * sum * alpha;
      const next = Math.max(largest / beta, beta / smallest);
      if (next > worst) {
        sum -= value;
        break;
      }
      worst = next;
    }
    if (dx < dy) {
      const edge = remaining ? y0 + (dy * sum) / remaining : y1;
      diceRow(values, start, end, sum, out, x0, y0, x1, edge);
      y0 = edge;
    } else {
      const edge = remaining ? x0 + (dx * sum) / remaining : x1;
      sliceRow(values, start, end, sum, out, x0, y0, edge, y1);
      x0 = edge;
    }
    remaining -= sum;
    start = end;
  }
  return completeRects(out, count, x0, y0);
};
export const treemapParts = (
  data: TreemapDatum[],
  sort: boolean,
  maxTiles: number | undefined,
  otherLabel: string
) => {
  const cleaned = data.map((datum, index) => ({
    color: datum.color,
    label: datum.label,
    sourceIndex: index,
    value: Math.max(0, datum.value) || 0,
  }));
  const ordered = sort
    ? sortCopy(cleaned, (a, b) => b.value - a.value)
    : cleaned;
  const limit = maxTiles && maxTiles > 0 ? Math.floor(maxTiles) : 0;
  if (!limit || ordered.length <= limit) {
    return ordered;
  }
  const kept = ordered.slice(0, Math.max(1, limit - 1));
  const rest = ordered.slice(Math.max(1, limit - 1));
  const tail = rest.reduce((sum, part) => sum + part.value, 0);
  if (tail <= 0) {
    return kept;
  }
  return [
    ...kept,
    { color: undefined, label: otherLabel, sourceIndex: -1, value: tail },
  ];
};
export const treemapTiles = (
  parts: ReturnType<typeof treemapParts>,
  width: number,
  height: number,
  gap: number,
  total: number,
  hue: string
): TreemapTile[] => {
  const size = { height, width };

  if (!parts.length || size.width <= 0 || size.height <= 0) {
    return [];
  }
  const rects = squarifyLayout(
    parts.map((part) => part.value),
    size.width,
    size.height
  );
  if (!rects.length) {
    return [];
  }
  const inset = Math.max(0, gap) / 2;
  const last = Math.max(parts.length - 1, 1);
  return parts.map((part, index) => {
    const rect = rects[index] ?? { height: 0, width: 0, x: 0, y: 0 };
    return {
      color: part.color ?? hue,
      height: Math.max(0, rect.height - inset * 2),
      label: part.label,
      share: total > 0 ? part.value / total : 0,
      sourceIndex: part.sourceIndex,
      strength: part.color ? 1 : 1 - (index / last) * FADE,
      value: part.value,
      width: Math.max(0, rect.width - inset * 2),
      x: rect.x + inset,
      y: rect.y + inset,
    };
  });
};
