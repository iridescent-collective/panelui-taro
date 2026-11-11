import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

import type { AvatarImageSource } from "../Avatar/types";

export interface LeaderboardEntry {
  id: string;
  name: string;
  value: number;
  avatar?: AvatarImageSource;
  subtitle?: string;
  change?: number;
}
export type LeaderboardPodium = "bars" | "cards" | "none";
export interface LeaderboardProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  data: readonly LeaderboardEntry[];
  podium?: LeaderboardPodium;
  order?: "desc" | "asc";
  podiumScale?: "value" | "rank";
  podiumHeight?: number;
  limit?: number;
  highlightId?: string;
  formatValue?: (value: number) => string;
  unit?: string;
  onPressEntry?: (entry: LeaderboardEntry, rank: number) => void;
  emptyText?: string;
}
