import { sortCopy } from "../../lib/sort-copy";

export interface RankableEntry {
  id: string;
  value: number;
}
export interface Ranked<T extends RankableEntry> {
  entry: T;
  rank: number;
  tied: boolean;
}
export const rankEntries = <T extends RankableEntry>(
  data: readonly T[],
  order: "desc" | "asc" = "desc"
): Ranked<T>[] => {
  const sign = order === "asc" ? 1 : -1;
  const finite = data
    .filter((entry) => Number.isFinite(entry.value))
    .map((entry, index) => ({ entry, index }));
  const sorted = sortCopy(
    finite,
    (a, b) => sign * (a.entry.value - b.entry.value) || a.index - b.index
  );
  const ranked: Ranked<T>[] = [];
  for (const [index, { entry }] of sorted.entries()) {
    const previous = ranked[index - 1];
    const rank =
      previous && previous.entry.value === entry.value
        ? previous.rank
        : index + 1;
    ranked.push({ entry, rank, tied: false });
  }
  for (const [index, current] of ranked.entries()) {
    current.tied =
      ranked[index - 1]?.rank === current.rank ||
      ranked[index + 1]?.rank === current.rank;
  }
  return ranked;
};
export const podiumHeights = (
  values: readonly number[],
  ranks: readonly number[],
  scale: "value" | "rank",
  floor = 0.4
): number[] => {
  if (scale === "rank") {
    const steps = [1, 0.74, 0.56];
    return ranks.map((rank) => steps[Math.min(rank, 3) - 1] ?? 0.56);
  }
  const peak = Math.max(...values.map((value) => Math.abs(value)), 0);
  if (peak === 0) {
    return values.map(() => 1);
  }
  return values.map((value) => floor + (1 - floor) * (Math.abs(value) / peak));
};
