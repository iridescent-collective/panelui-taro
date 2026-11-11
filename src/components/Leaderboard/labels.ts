import type { Ranked } from "./leaderboard-rank";
import type { LeaderboardEntry } from "./types";

export const initials = (name: string) => {
  const parts = name.trim().split(/\s+/u).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
};
export const defaultFormat = (value: number) => value.toLocaleString("en-US");
export const describe = (
  { entry, rank, tied }: Ranked<LeaderboardEntry>,
  label: string,
  unit: string | undefined
) => {
  const place = tied ? `Rank ${rank}, tied` : `Rank ${rank}`;
  const parts = [place, entry.name, unit ? `${label} ${unit}` : label];
  if (entry.subtitle) {
    parts.splice(2, 0, entry.subtitle);
  }
  if (entry.change) {
    const n = Math.abs(entry.change);
    parts.push(
      `${entry.change > 0 ? "up" : "down"} ${n} ${n === 1 ? "place" : "places"}`
    );
  } else if (entry.change === 0) {
    parts.push("no change");
  }
  return parts.join(", ");
};
