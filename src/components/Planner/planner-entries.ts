import { sortCopy } from "../../lib/sort-copy";

export interface PlannerDatedEntry {
  date: Date;
  category?: string;
}
export interface PlannerCountedCategory {
  id: string;
  label: string;
  count: number;
}
export const dayKey = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
export const bucketByDay = <T extends PlannerDatedEntry>(
  entries: readonly T[]
): Map<number, T[]> => {
  const days = new Map<number, T[]>();
  for (const entry of entries) {
    const key = dayKey(entry.date);
    const bucket = days.get(key);
    if (bucket) {
      bucket.push(entry);
    } else {
      days.set(key, [entry]);
    }
  }
  return days;
};
const EMPTY: never[] = Object.freeze([]) as never[];
export const entriesOn = <T extends PlannerDatedEntry>(
  days: Map<number, T[]>,
  date: Date
): T[] => days.get(dayKey(date)) ?? EMPTY;

export const visibleEntries = <T>(
  entries: readonly T[],
  limit: number
): {
  shown: T[];
  overflow: number;
} => {
  const cap = Math.max(0, Math.floor(limit));
  if (entries.length <= cap) {
    return { overflow: 0, shown: [...entries] };
  }
  return { overflow: entries.length - cap, shown: entries.slice(0, cap) };
};
export const dayAccessibilityLabel = <T extends PlannerDatedEntry>(
  dateLabel: string,
  entries: readonly T[],
  categoryLabels: ReadonlyMap<string, string>
): string => {
  if (entries.length === 0) {
    return `${dateLabel}, nothing planned`;
  }
  const named: string[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const label = entry.category
      ? categoryLabels.get(entry.category)
      : undefined;
    if (label && !seen.has(label)) {
      seen.add(label);
      named.push(label);
    }
  }
  const count = `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;
  return named.length > 0
    ? `${dateLabel}, ${count}: ${named.join(", ")}`
    : `${dateLabel}, ${count}`;
};
export const summariseMonth = <T extends PlannerDatedEntry>(
  days: Map<number, T[]>,
  grid: readonly (readonly Date[])[],
  categories: readonly {
    id: string;
    label: string;
  }[],
  isInMonth: (date: Date) => boolean
): {
  total: number;
  categories: PlannerCountedCategory[];
} => {
  const counts = new Map<string, number>();
  let total = 0;
  for (const week of grid) {
    for (const date of week) {
      if (!isInMonth(date)) {
        continue;
      }
      for (const entry of entriesOn(days, date)) {
        total += 1;
        if (entry.category) {
          counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
        }
      }
    }
  }
  return {
    categories: categories.map(({ id, label }) => ({
      count: counts.get(id) ?? 0,
      id,
      label,
    })),
    total,
  };
};
export const entryTimeMinutes = (date: Date): number | null => {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes === 0 ? null : minutes;
};
export const sortByTime = <T extends PlannerDatedEntry>(
  entries: readonly T[]
): T[] =>
  sortCopy(
    entries.map((entry, index) => ({
      at: entryTimeMinutes(entry.date),
      entry,
      index,
    })),
    (a, b) => {
      if (a.at === null && b.at === null) {
        return a.index - b.index;
      }
      if (a.at === null) {
        return -1;
      }
      if (b.at === null) {
        return 1;
      }
      return a.at === b.at ? a.index - b.index : a.at - b.at;
    }
  ).map(({ entry }) => entry);
