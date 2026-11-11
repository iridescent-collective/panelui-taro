import { useMemo } from "react";

import { defaultFormat } from "./labels";
import { podiumHeights, rankEntries } from "./leaderboard-rank";
import type { LeaderboardProps } from "./types";

export const useLeaderboardModel = (props: LeaderboardProps) => {
  const {
    data,
    order = "desc",
    podium = "bars",
    podiumScale = "value",
    podiumHeight = 132,
    limit,
    highlightId,
    formatValue = defaultFormat,
    emptyText = "No entries yet",
  } = props;
  const ranked = useMemo(() => rankEntries(data, order), [data, order]);
  const shown =
    limit === undefined ? ranked : ranked.slice(0, Math.max(0, limit));
  const pinned =
    highlightId !== undefined &&
    !shown.some((item) => item.entry.id === highlightId)
      ? ranked.find((item) => item.entry.id === highlightId)
      : undefined;
  const top = podium === "none" ? [] : shown.slice(0, 3);
  const rest = podium === "none" ? shown : shown.slice(3);
  const seats = [top[1], top[0], top[2]].flatMap((item, index) => {
    if (!item) {
      return [];
    }
    const place = ([2, 1, 3] as const)[index];
    return place ? [{ item, place }] : [];
  });
  const heights = podiumHeights(
    seats.map((seat) => seat.item.entry.value),
    seats.map((seat) => seat.item.rank),
    order === "asc" ? "rank" : podiumScale
  );
  return {
    emptyText,
    formatValue,
    heights,
    pinned,
    podium,
    podiumHeight,
    ranked,
    rest,
    seats,
  };
};
