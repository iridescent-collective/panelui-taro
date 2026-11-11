import type {
  LeaderboardEntry,
  LeaderboardPodium,
} from "panelui-taro/leaderboard";

export const RANKING_ENTRIES: readonly LeaderboardEntry[] = [
  {
    change: 2,
    id: "maya",
    name: "Maya Chen",
    subtitle: "Team A",
    value: 12_480,
  },
  { change: 0, id: "omar", name: "Omar Haddad", value: 11_930 },
  { change: -1, id: "lena", name: "Lena Brandt", value: 11_930 },
  { id: "sam", name: "Sam Okafor", subtitle: "Team B", value: 9870 },
  { change: 1, id: "alex", name: "Alex Reed", value: 8800 },
  { id: "kai", name: "Kai Lin", value: 7100 },
];
export const PODIUM_OPTIONS: readonly LeaderboardPodium[] = [
  "bars",
  "cards",
  "none",
];
