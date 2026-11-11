import { normalizeWeekStart, startOfDay } from "../../lib/date";
import { DAYS_IN_WEEK, MONTHS } from "./constants";
import type {
  HeatmapColumn,
  HeatmapBin,
  HeatmapCell,
  Grid,
  HeatmapLayout,
} from "./types";

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export const buildHeatmapCalendar = (
  entries: {
    date: Date;
    count: number;
  }[],
  options: {
    start?: Date;
    end?: Date;
    weekStartDay?: number;
  } = {}
): HeatmapColumn[] => {
  const weekStartDay = normalizeWeekStart(options.weekStartDay ?? 0);
  if (!entries.length && !options.start) {
    return [];
  }
  const times = entries.map((entry) => entry.date.getTime());
  const start = startOfDay(options.start ?? new Date(Math.min(...times)));
  const end = startOfDay(options.end ?? new Date(Math.max(...times)));
  const byDay = new Map<string, number>();
  for (const entry of entries) {
    const key = dayKey(entry.date);
    byDay.set(key, (byDay.get(key) ?? 0) + entry.count);
  }
  const cursor = startOfDay(start);
  cursor.setDate(cursor.getDate() - ((cursor.getDay() - weekStartDay + 7) % 7));
  const columns: HeatmapColumn[] = [];
  let column: HeatmapBin[] = [];
  let pending = cursor <= end;
  while (pending || column.length) {
    const row = (cursor.getDay() - weekStartDay + 7) % 7;
    const date = new Date(cursor);
    const inRange = date >= start && date <= end;
    column.push({
      bin: row,
      count: inRange ? (byDay.get(dayKey(date)) ?? 0) : 0,
      date: inRange ? date : undefined,
    });
    if (row === DAYS_IN_WEEK - 1) {
      columns.push({ bin: columns.length, bins: column });
      column = [];
      if (cursor > end) {
        break;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
    pending = cursor <= end;
  }
  return columns;
};
export const deriveLevels = (data: HeatmapColumn[]): number[] => {
  const counts: number[] = [];
  for (const column of data) {
    for (const bin of column.bins) {
      if (bin.count > 0) {
        counts.push(bin.count);
      }
    }
  }
  if (!counts.length) {
    return [1, 2, 3, 4];
  }
  counts.sort((a, b) => a - b);
  const at = (fraction: number) =>
    counts[Math.min(counts.length - 1, Math.floor(counts.length * fraction))] ??
    1;
  const thresholds = [1, at(0.25), at(0.5), at(0.75)];
  for (let i = 1; i < thresholds.length; i += 1) {
    if (thresholds[i] <= thresholds[i - 1]) {
      thresholds[i] = thresholds[i - 1] + 1;
    }
  }
  return thresholds;
};
export const defaultTooltipLabel = (cell: HeatmapCell) => {
  if (!cell.date) {
    return `${cell.count}`;
  }
  const count = `${cell.count} ${cell.count === 1 ? "contribution" : "contributions"}`;
  const date = `${MONTHS[cell.date.getMonth()]} ${cell.date.getDate()}`;
  return `${count} on ${date}`;
};
export const heatmapLevel = (count: number, thresholds: number[]) => {
  if (count <= 0) {
    return 0;
  }
  let level = 1;
  for (let index = 1; index < thresholds.length; index += 1) {
    if (count >= thresholds[index]) {
      level = index + 1;
    }
  }
  return Math.min(level, 4);
};
export const heatmapGrid = (
  columns: number,
  width: number,
  axisWidth: number,
  layout: HeatmapLayout,
  binSize: number,
  gap: number,
  rows: number
): Grid => {
  if (!columns) {
    return { columns: 0, gap, height: 0, rows, size: 0, width: 0 };
  }
  const available = Math.max(width - axisWidth, 0);
  const size =
    layout === "fill" && available > 0
      ? Math.max((available - (columns - 1) * gap) / columns, 1)
      : binSize;
  return {
    columns,
    gap,
    height: rows * size + (rows - 1) * gap,
    rows,
    size,
    width: columns * size + (columns - 1) * gap,
  };
};
export const heatmapHit = (x: number, y: number, grid: Grid) => {
  const step = grid.size + grid.gap;
  const column = Math.floor(x / step);
  const row = Math.floor(y / step);
  if (column < 0 || column >= grid.columns || row < 0 || row >= grid.rows) {
    return null;
  }
  return { column, row };
};
