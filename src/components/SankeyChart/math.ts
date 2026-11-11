import { sortCopy } from "../../lib/sort-copy";
import type { SankeyLayout, SankeyLayoutNode } from "./sankey-layout";

const LABEL_GAP = 6;
const LABEL_LINE = 20;
export const nameWidth = (name: string): number => name.length * 7 + 18;
export const progress = (clock: number, from: number, to: number): number => {
  const range = to - from;
  const raw = range > 0 ? (clock - from) / range : 1;
  const clamped = Math.min(1, Math.max(0, raw));
  return 1 - (1 - clamped) * (1 - clamped) * (1 - clamped);
};
export const flowPathVertical = (
  y0: number,
  cx0: number,
  y1: number,
  cx1: number,
  thickness: number,
  curve: number
): string => {
  if (!(thickness > 0)) {
    return "";
  }
  const half = thickness / 2;
  const leftStart = cx0 - half;
  const leftEnd = cx1 - half;
  const rightStart = cx0 + half;
  const rightEnd = cx1 + half;
  const run = y1 - y0;
  const near = y0 + run * curve;
  const far = y1 - run * curve;
  return (
    `M${leftStart},${y0}` +
    `C${leftStart},${near},${leftEnd},${far},${leftEnd},${y1}` +
    `L${rightEnd},${y1}` +
    `C${rightEnd},${far},${rightStart},${near},${rightStart},${y0}` +
    `Z`
  );
};
export const flowPath = (
  x0: number,
  cy0: number,
  x1: number,
  cy1: number,
  thickness: number,
  curve: number
): string => {
  if (!(thickness > 0)) {
    return "";
  }
  const half = thickness / 2;
  const topStart = cy0 - half;
  const topEnd = cy1 - half;
  const bottomStart = cy0 + half;
  const bottomEnd = cy1 + half;
  const run = x1 - x0;
  const near = x0 + run * curve;
  const far = x1 - run * curve;
  return (
    `M${x0},${topStart}` +
    `C${near},${topStart},${far},${topEnd},${x1},${topEnd}` +
    `L${x1},${bottomEnd}` +
    `C${far},${bottomEnd},${near},${bottomStart},${x0},${bottomStart}` +
    `Z`
  );
};
interface LabelPlacement {
  crossFrom: number;
  crossSize: number;
  extent: number;
  gap: { from: number; size: number };
  node: SankeyLayoutNode;
  show: boolean;
  trailing: boolean;
}
const placeVerticalNames = (
  placed: LabelPlacement[],
  crossSpan: number,
  labelFor: (id: string) => string
) => {
  const taken = new Map<number, [number, number][]>();
  const order = sortCopy(placed, (a, b) => b.node.value - a.node.value);
  for (const entry of order) {
    if (!entry.show) {
      continue;
    }
    const centre = (entry.node.x0 + entry.node.x1) / 2;
    const size = Math.min(
      crossSpan,
      Math.max(entry.extent, nameWidth(labelFor(entry.node.id)))
    );
    const boxes = taken.get(entry.node.layer) ?? [];
    let lo = 0;
    let hi = crossSpan;
    for (const [a, b] of boxes) {
      if (b <= centre) {
        lo = Math.max(lo, b + LABEL_GAP);
      } else if (a >= centre) {
        hi = Math.min(hi, a - LABEL_GAP);
      } else {
        lo = centre;
        hi = centre;
      }
    }
    if (hi - lo < size) {
      entry.show = false;
      continue;
    }
    const from = Math.max(lo, Math.min(centre - size / 2, hi - size));
    if (centre < from || centre > from + size) {
      entry.show = false;
      continue;
    }
    boxes.push([from, from + size]);
    taken.set(entry.node.layer, boxes);
    entry.crossFrom = from;
    entry.crossSize = size;
  }
  return placed;
};
export const labelPlacements = (
  layout: SankeyLayout,
  width: number,
  height: number,
  upright: boolean,
  minHeight: number,
  showValue: boolean,
  labelFor: (id: string) => string
) => {
  const drawing = layout.nodes.length > 0;

  if (!drawing) {
    return [];
  }
  const alongStart = (node: SankeyLayoutNode) => (upright ? node.x0 : node.y0);
  const alongEnd = (node: SankeyLayoutNode) => (upright ? node.x1 : node.y1);
  const crossStart = (node: SankeyLayoutNode) => (upright ? node.y0 : node.x0);
  const crossEnd = (node: SankeyLayoutNode) => (upright ? node.y1 : node.x1);
  const alongSpan = upright ? width : height;
  const crossSpan = upright ? height : width;
  const edges: number[] = [];
  for (const placed of layout.nodes) {
    if (!edges.includes(alongStart(placed))) {
      edges.push(alongStart(placed));
    }
    if (!edges.includes(alongEnd(placed))) {
      edges.push(alongEnd(placed));
    }
  }
  const sortedEdges = sortCopy(edges, (a, b) => a - b);
  const placed = layout.nodes.map((node) => {
    const extent = crossEnd(node) - crossStart(node);
    const after = sortedEdges.find((edge) => edge > alongEnd(node) + 1e-6);
    let before: number | undefined;
    for (const edge of sortedEdges) {
      if (edge < alongStart(node) - 1e-6) {
        before = edge;
      }
    }
    const trailing = after === undefined;
    const gap = trailing
      ? (() => {
          const from =
            before === undefined ? 0 : (before + alongStart(node)) / 2;
          return {
            from,
            size: Math.max(0, alongStart(node) - LABEL_GAP - from),
          };
        })()
      : (() => {
          const from = alongEnd(node) + LABEL_GAP;
          const to =
            after === undefined ? alongSpan : (alongEnd(node) + after) / 2;
          return { from, size: Math.max(0, to - from) };
        })();
    const crossFrom = Math.max(
      0,
      Math.min(crossStart(node), crossSpan - extent)
    );
    const crossSize = extent;
    const show = extent >= minHeight;
    return { crossFrom, crossSize, extent, gap, node, show, trailing };
  });
  if (!upright) {
    return placeVerticalNames(placed, crossSpan, labelFor);
  }
  const lineHeight = showValue ? LABEL_LINE * 2 : LABEL_LINE;
  const kept = new Map<string, [number, number][]>();
  const order = sortCopy(placed, (a, b) => b.node.value - a.node.value);
  for (const entry of order) {
    if (!entry.show) {
      continue;
    }
    const centre = (entry.node.y0 + entry.node.y1) / 2;
    const size = Math.max(entry.extent, lineHeight);
    const from = Math.max(0, Math.min(centre - size / 2, height - size));
    const to = from + size;
    const key = `${entry.node.layer}:${entry.trailing ? "end" : "start"}`;
    const taken = kept.get(key) ?? [];
    if (taken.some(([a, b]) => from < b && to > a)) {
      entry.show = false;
      continue;
    }
    taken.push([from, to]);
    kept.set(key, taken);
    entry.crossFrom = from;
    entry.crossSize = size;
  }
  return placed;
};
