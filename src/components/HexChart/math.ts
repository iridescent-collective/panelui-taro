import { polarPoint } from "../../lib/chart";
import type { ChartPoint } from "../../lib/chart";
import { sortCopy } from "../../lib/sort-copy";
import type { HexMetrics, HexShape, HexCell, HexPlan, HexDatum } from "./types";

const BLOB_WOBBLE = 0.09;
const EMPTY_PLAN: HexPlan = {
  counts: [],
  field: "",
  labelAnchors: [],
  owners: [],
  paths: [],
};
export const hexMetrics = (radius: number): HexMetrics => {
  const width = Math.sqrt(3) * radius;
  return {
    height: radius * 2,
    radius,
    stepX: width,
    stepY: radius * 1.5,
    width,
  };
};
export const hexRadiusFor = (width: number, columns: number): number => {
  if (width <= 0 || columns <= 0) {
    return 0;
  }
  return width / (columns + 0.5) / Math.sqrt(3);
};
export const hexRowsFor = (height: number, metrics: HexMetrics): number => {
  if (height <= 0 || metrics.stepY <= 0) {
    return 0;
  }
  return Math.max(1, Math.floor((height - metrics.height / 4) / metrics.stepY));
};
export const hexCenter = (
  column: number,
  row: number,
  metrics: HexMetrics,
  left: number,
  top: number
): ChartPoint => {
  const offset = row % 2 === 1 ? metrics.stepX / 2 : 0;
  return {
    x: left + metrics.stepX / 2 + offset + column * metrics.stepX,
    y: top + metrics.radius + row * metrics.stepY,
  };
};
export const hexPath = (cx: number, cy: number, radius: number): string => {
  if (radius <= 0) {
    return "";
  }
  let d = "";
  for (let corner = 0; corner < 6; corner += 1) {
    const point = polarPoint(cx, cy, radius, corner / 6);
    d += `${corner === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`;
  }
  return `${d}Z`;
};
export const hashUnit = (a: number, b: number): number => {
  let h = Math.imul(a + 1, 374_761_393) ^ Math.imul(b + 1, 668_265_263);
  h = Math.imul(h ^ (h >>> 13), 1_274_126_177);
  return ((h ^ (h >>> 16)) >>> 0) / 4_294_967_296;
};
export const shareCounts = (values: number[], budget: number): number[] => {
  const total = values.reduce((sum, value) => sum + Math.max(0, value), 0);
  if (total <= 0 || budget <= 0) {
    return values.map(() => 0);
  }
  const exact = values.map((value) => (Math.max(0, value) / total) * budget);
  const counts = exact.map((value) => Math.floor(value));
  const spare = Math.min(
    budget - counts.reduce((sum, count) => sum + count, 0),
    values.length
  );
  const byFraction = sortCopy(
    exact.map((value, index) => ({
      fraction: value - Math.floor(value),
      index,
    })),
    (a, b) => b.fraction - a.fraction || a.index - b.index
  );
  for (let i = 0; i < spare; i += 1) {
    const { index } = byFraction[i];
    counts[index] += 1;
  }
  return counts;
};
export const hexFillOrder = (
  columns: number,
  rows: number,
  shape: HexShape
): HexCell[] => {
  const cells: HexCell[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      cells.push({ column, row });
    }
  }
  if (shape === "grid" || columns < 2 || rows < 2) {
    return cells;
  }
  const midColumn = (columns - 1) / 2;
  const midRow = (rows - 1) / 2;
  return sortCopy(
    cells.map((cell) => {
      const column = cell.column + (cell.row % 2 === 1 ? 0.5 : 0);
      const dx = (column - midColumn) / columns;
      const dy = (cell.row - midRow) / rows;
      const wobble = (hashUnit(cell.column, cell.row) - 0.5) * BLOB_WOBBLE;
      const squared = dx * dx + dy * dy;
      return { cell, key: Math.sqrt(squared) + wobble };
    }),
    (a, b) => a.key - b.key
  ).map((entry) => entry.cell);
};
export const hexAt = (
  x: number,
  y: number,
  metrics: HexMetrics,
  left: number,
  top: number,
  columns: number,
  rows: number
): HexCell | null => {
  if (metrics.radius <= 0) {
    return null;
  }
  const approximateRow = Math.round((y - top - metrics.radius) / metrics.stepY);
  let best: HexCell | null = null;
  let bestDistance = Infinity;
  for (let row = approximateRow - 1; row <= approximateRow + 1; row += 1) {
    if (row < 0 || row >= rows) {
      continue;
    }
    const offset = row % 2 === 1 ? metrics.stepX / 2 : 0;
    const column = Math.round(
      (x - left - metrics.stepX / 2 - offset) / metrics.stepX
    );
    if (column < 0 || column >= columns) {
      continue;
    }
    const centre = hexCenter(column, row, metrics, left, top);
    const dx = x - centre.x;
    const dy = y - centre.y;
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = { column, row };
    }
  }
  return best !== null && bestDistance <= metrics.radius * metrics.radius
    ? best
    : null;
};
const hexBudget = (
  loading: boolean,
  shape: HexShape,
  capacity: number,
  density: number
) => {
  if (loading) {
    return 0;
  }
  if (shape === "grid") {
    return capacity;
  }
  return Math.max(0, Math.min(capacity, Math.round(capacity * density)));
};
export const hexPlan = (
  data: HexDatum[],
  metrics: HexMetrics,
  rows: number,
  columnCount: number,
  shape: HexShape,
  density: number,
  cellGap: number,
  left: number,
  top: number,
  fieldWidth: number,
  loading: boolean
): HexPlan => {
  if (metrics.radius <= 0 || rows <= 0 || !data.length) {
    return EMPTY_PLAN;
  }
  const cells = hexFillOrder(columnCount, rows, shape);
  const capacity = columnCount * rows;
  const budget = hexBudget(loading, shape, capacity, density);
  const counts = shareCounts(
    data.map((series) => series.value),
    budget
  );
  const declared = data.map((_, index) => index);
  const sequence =
    shape === "blob"
      ? sortCopy(declared, (a, b) => counts[a] - counts[b] || a - b)
      : declared;
  const radius = metrics.radius * (1 - Math.max(0, Math.min(cellGap, 0.5)));
  const owners = Array.from({ length: capacity }, () => -1);
  const paths = data.map(() => "");
  const sums = data.map(() => ({ highest: Infinity, x: 0 }));
  let cursor = 0;
  for (const series of sequence) {
    for (let n = 0; n < counts[series]; n += 1) {
      const cell = cells[cursor];
      cursor += 1;
      if (!cell) {
        break;
      }
      owners[cell.row * columnCount + cell.column] = series;
      const centre = hexCenter(cell.column, cell.row, metrics, left, top);
      paths[series] += hexPath(centre.x, centre.y, radius);
      sums[series].x += centre.x;
      sums[series].highest = Math.min(sums[series].highest, centre.y);
    }
  }
  let field = "";
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      if (owners[row * columnCount + column] >= 0) {
        continue;
      }
      const centre = hexCenter(column, row, metrics, left, top);
      field += hexPath(centre.x, centre.y, radius);
    }
  }
  const labelAnchors = sums.map((sum, index) => {
    const count = counts[index] ?? 0;
    if (count <= 0) {
      return { x: left + fieldWidth / 2, y: top };
    }
    return { x: sum.x / count, y: sum.highest - metrics.radius };
  });
  return { counts, field, labelAnchors, owners, paths };
};
