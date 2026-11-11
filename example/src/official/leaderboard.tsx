import { Badge } from "panelui-taro/badge";
import { Card } from "panelui-taro/card";
import {
  Leaderboard,
  type LeaderboardEntry,
} from "panelui-taro/leaderboard";
import { Text } from "panelui-taro/primitives/text";
import { Tabs } from "panelui-taro/tabs";
import { useState, type ReactNode } from "react";

import { useSafeAreaInsets } from "../runtime/native";
import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const face = (n: number) => `https://i.pravatar.cc/150?img=${n}`;
const WALKERS_THIS_WEEK: LeaderboardEntry[] = [
  { id: "maya", name: "Maya Chen", value: 84210, change: 2, avatar: face(47) },
  {
    id: "omar",
    name: "Omar Haddad",
    value: 79655,
    change: -1,
    avatar: face(12),
  },
  {
    id: "lena",
    name: "Lena Brandt",
    value: 71038,
    change: 1,
    avatar: face(44),
  },
  { id: "sam", name: "Sam Okafor", value: 66402, change: 3, avatar: face(53) },
  {
    id: "ines",
    name: "Inès Moreau",
    value: 61987,
    change: -2,
    avatar: face(32),
  },
  { id: "jonas", name: "Jonas Lindqvist", value: 58340, change: 0 },
  {
    id: "priya",
    name: "Priya Nair",
    value: 55126,
    change: 4,
    avatar: face(25),
  },
  {
    id: "kofi",
    name: "Kofi Mensah",
    value: 49870,
    change: -1,
    avatar: face(59),
  },
  { id: "hana", name: "Hana Suzuki", value: 47213, change: 0 },
  {
    id: "diego",
    name: "Diego Alvarez",
    value: 41958,
    change: -3,
    avatar: face(60),
  },
  { id: "zara", name: "Zara Ahmed", value: 38604, change: 1 },
  {
    id: "tom",
    name: "Tom Whitfield",
    value: 33117,
    change: -1,
    avatar: face(14),
  },
  { id: "elif", name: "Elif Yılmaz", value: 29482, change: 2 },
  {
    id: "noah",
    name: "Noah Berger",
    value: 21735,
    change: -2,
    avatar: face(68),
  },
];
const WALKERS_LAST_WEEK: LeaderboardEntry[] = [
  {
    id: "omar",
    name: "Omar Haddad",
    value: 91402,
    change: 0,
    avatar: face(12),
  },
  { id: "maya", name: "Maya Chen", value: 76318, change: 1, avatar: face(47) },
  {
    id: "ines",
    name: "Inès Moreau",
    value: 74890,
    change: 2,
    avatar: face(32),
  },
  {
    id: "lena",
    name: "Lena Brandt",
    value: 69215,
    change: -2,
    avatar: face(44),
  },
  { id: "jonas", name: "Jonas Lindqvist", value: 60177, change: 1 },
  {
    id: "kofi",
    name: "Kofi Mensah",
    value: 57731,
    change: 3,
    avatar: face(59),
  },
  {
    id: "diego",
    name: "Diego Alvarez",
    value: 54062,
    change: -1,
    avatar: face(60),
  },
  { id: "sam", name: "Sam Okafor", value: 48829, change: -4, avatar: face(53) },
  { id: "hana", name: "Hana Suzuki", value: 45990, change: 0 },
  {
    id: "tom",
    name: "Tom Whitfield",
    value: 39408,
    change: 2,
    avatar: face(14),
  },
  {
    id: "priya",
    name: "Priya Nair",
    value: 36251,
    change: -1,
    avatar: face(25),
  },
  { id: "zara", name: "Zara Ahmed", value: 31874, change: 0 },
  {
    id: "noah",
    name: "Noah Berger",
    value: 27106,
    change: 1,
    avatar: face(68),
  },
  { id: "elif", name: "Elif Yılmaz", value: 19943, change: -1 },
];
function LeaderboardScreen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerStyle={{
        padding: 16,
        paddingBottom: insets.bottom + 24,
        gap: 20,
      }}
    >
      {children}
    </ScrollView>
  );
}
function LeaderboardStepsVersion() {
  const [week, setWeek] = useState("this");
  return (
    <LeaderboardScreen>
      <View className="gap-1">
        <Text size="2xl" weight="bold">
          Step challenge
        </Text>
        <Text size="sm" muted>
          {week === "this"
            ? "Sep 29 – Oct 5 · ends in 3 days"
            : "Sep 22 – Sep 28 · final"}
        </Text>
      </View>
      <Tabs value={week} defaultValue={week} onValueChange={setWeek}>
        <Tabs.List>
          <Tabs.Trigger value="this">This week</Tabs.Trigger>
          <Tabs.Trigger value="last">Last week</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
      <Leaderboard
        data={week === "this" ? WALKERS_THIS_WEEK : WALKERS_LAST_WEEK}
        unit="steps"
        podiumHeight={140}
      />
    </LeaderboardScreen>
  );
}
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const REPS: LeaderboardEntry[] = [
  {
    id: "r1",
    name: "Rachel Kim",
    subtitle: "Seattle",
    value: 412800,
    change: 1,
  },
  {
    id: "r2",
    name: "Marcus Bell",
    subtitle: "Denver",
    value: 387450,
    change: -1,
  },
  { id: "r3", name: "Ana Sousa", subtitle: "Austin", value: 341920, change: 2 },
  {
    id: "r4",
    name: "Victor Hale",
    subtitle: "Portland",
    value: 298300,
    change: 0,
  },
  {
    id: "r5",
    name: "Grace Liu",
    subtitle: "San Diego",
    value: 276140,
    change: 3,
  },
  {
    id: "r6",
    name: "Ben Carter",
    subtitle: "Phoenix",
    value: 251775,
    change: -2,
  },
  {
    id: "r7",
    name: "Nadia Rahman",
    subtitle: "Seattle",
    value: 219060,
    change: 0,
  },
  {
    id: "r8",
    name: "Leo Fischer",
    subtitle: "Boise",
    value: 184395,
    change: -1,
  },
  {
    id: "r9",
    name: "Chloe Martin",
    subtitle: "Denver",
    value: 152880,
    change: 1,
  },
  {
    id: "r10",
    name: "Ivan Petrov",
    subtitle: "Salt Lake City",
    value: 97410,
    change: -3,
  },
];
function LeaderboardSalesVersion() {
  const total = REPS.reduce((sum, rep) => sum + rep.value, 0);
  return (
    <LeaderboardScreen>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text size="sm" muted>
            Closed revenue, Q3
          </Text>
          <Text size="3xl" weight="bold" className="tabular-nums">
            {currency.format(total)}
          </Text>
        </View>
        <Badge variant="outline">Team West</Badge>
      </View>
      <Leaderboard
        data={REPS}
        podium="cards"
        formatValue={(value) => currency.format(value)}
        unit="in closed deals"
      />
    </LeaderboardScreen>
  );
}
const LEAGUE: LeaderboardEntry[] = [
  ["Nightjar", 18420],
  ["quietstorm", 17985],
  ["Pip", 17302],
  ["mossbyte", 16110],
  ["Ferro", 15874],
  ["luna.exe", 15233],
  ["Basalt", 14907],
  ["kitekat", 14412],
  ["Orrin", 13958],
  ["saffron", 13640],
  ["DuneRunner", 13105],
  ["wren", 12877],
  ["Calyx", 12354],
  ["tidepool", 12019],
  ["Juno", 11782],
  ["Halcyon", 11240],
  ["brightside", 10968],
  ["Rook", 10511],
  ["ember", 10230],
  ["Vesper", 9876],
  ["paper.plane", 9502],
  ["Ostara", 9318],
  ["glimmer", 8995],
  ["Talon", 8642],
  ["marigold", 8407],
  ["Quill", 8113],
  ["you", 7820],
  ["Sable", 7469],
  ["driftwood", 7095],
  ["Ivo", 6830],
  ["hollow", 6372],
  ["Cobalt", 6018],
  ["nimbus", 5741],
  ["Arden", 5266],
  ["fable", 4930],
  ["Mica", 4402],
  ["lowtide", 3985],
  ["Bram", 3361],
  ["sprout", 2870],
  ["Echo", 1945],
].map(([name, value], index) => ({
  id: name === "you" ? "you" : `p${index}`,
  name: name === "you" ? "You" : (name as string),
  value: value as number,
  subtitle: name === "you" ? "1,180 XP behind #26" : undefined,
}));
function LeaderboardLeagueVersion() {
  return (
    <LeaderboardScreen>
      <Card>
        <Card.Header>
          <Card.Title>Gold league</Card.Title>
          <Card.Description>
            Top 10 move up to Sapphire. Resets Sunday.
          </Card.Description>
        </Card.Header>
      </Card>
      <Leaderboard
        data={LEAGUE}
        limit={10}
        highlightId="you"
        unit="XP"
        podiumScale="rank"
      />
    </LeaderboardScreen>
  );
}
const lap = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toFixed(3).padStart(6, "0")}`;
const LAPS: LeaderboardEntry[] = [
  {
    id: "d1",
    name: "Rio Castellan",
    subtitle: "Halvorsen",
    value: 80.912,
    change: 1,
  },
  {
    id: "d2",
    name: "Theo Marchetti",
    subtitle: "Arcadia",
    value: 81.047,
    change: -1,
  },
  {
    id: "d3",
    name: "Kaito Mori",
    subtitle: "Halvorsen",
    value: 81.047,
    change: 2,
  },
  {
    id: "d4",
    name: "Elsa Varga",
    subtitle: "Brightline",
    value: 81.203,
    change: 0,
  },
  {
    id: "d5",
    name: "Hugo Delacroix",
    subtitle: "Arcadia",
    value: 81.388,
    change: -2,
  },
  {
    id: "d6",
    name: "Amara Osei",
    subtitle: "Northwind",
    value: 81.455,
    change: 1,
  },
  {
    id: "d7",
    name: "Finn Doyle",
    subtitle: "Brightline",
    value: 81.716,
    change: 0,
  },
  {
    id: "d8",
    name: "Sofia Lindgren",
    subtitle: "Vantor",
    value: 81.802,
    change: 3,
  },
  {
    id: "d9",
    name: "Mateo Rossi",
    subtitle: "Northwind",
    value: 82.034,
    change: -1,
  },
  {
    id: "d10",
    name: "Yara Haddad",
    subtitle: "Vantor",
    value: 82.517,
    change: -3,
  },
];
function LeaderboardLapsVersion() {
  return (
    <LeaderboardScreen>
      <View className="gap-1">
        <Text
          size="xs"
          weight="semibold"
          muted
          className="tracking-widest uppercase"
        >
          Qualifying · Q3
        </Text>
        <Text size="2xl" weight="bold">
          Fastest laps
        </Text>
        <Text size="sm" muted>
          Two drivers tied on 1:21.047 share second.
        </Text>
      </View>
      <Leaderboard data={LAPS} order="asc" podium="none" formatValue={lap} />
    </LeaderboardScreen>
  );
}
function LeaderboardShortDemo() {
  return (
    <Leaderboard
      podium="none"
      data={[
        {
          id: "a",
          name: "Priya Nair",
          value: 412,
          change: 3,
          subtitle: "Design",
        },
        {
          id: "b",
          name: "Tomás Ruiz",
          value: 398,
          change: 0,
          subtitle: "Platform",
        },
        {
          id: "c",
          name: "Aiko Tanaka",
          value: 377,
          change: -2,
          subtitle: "Growth",
        },
      ]}
      unit="points"
    />
  );
}
function LeaderboardEmptyDemo() {
  return (
    <Leaderboard data={[]} emptyText="Nobody has logged a run this week" />
  );
}
export const entry: ComponentEntry = {
  slug: "leaderboard",
  name: "Leaderboard",
  summary: "Entries ranked by a value, with the top three on a podium",
  demos: [
    {
      label: "Step challenge",
      id: "steps",
      fullPage: true,
      description:
        "The bar podium, scaled to the values. Switch weeks and the bars regrow to the new totals.",
      render: () => <LeaderboardStepsVersion />,
    },
    {
      label: "Sales team",
      id: "sales",
      fullPage: true,
      description:
        "Cards for the top three, with revenue written out in currency.",
      render: () => <LeaderboardSalesVersion />,
    },
    {
      label: "Weekly league",
      id: "league",
      fullPage: true,
      description:
        "Forty players cut to ten. You are 27th, so your row is pinned under the list with its real place.",
      render: () => <LeaderboardLeagueVersion />,
    },
    {
      label: "Fastest laps",
      id: "laps",
      fullPage: true,
      description: "Lowest time first, no podium, and a tie for second.",
      render: () => <LeaderboardLapsVersion />,
    },
    { label: "A short list", render: () => <LeaderboardShortDemo /> },
    { label: "Nothing to rank", render: () => <LeaderboardEmptyDemo /> },
  ],
};
