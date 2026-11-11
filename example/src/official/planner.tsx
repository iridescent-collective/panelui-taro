import { Planner, type PlannerEntry } from "panelui-taro/planner";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { Image, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const PLANNER_CATEGORIES = [
  { id: "monthly", label: "Monthly", color: "#8b5cf6" },
  { id: "yearly", label: "Yearly", color: "#eab308" },
];
function plannerEntries(month: Date): PlannerEntry[] {
  const on = (day: number, label: string, category: string) => ({
    id: `${label}-${day}`,
    date: new Date(month.getFullYear(), month.getMonth(), day),
    label,
    category,
  });
  return [
    on(2, "Netflix", "monthly"),
    on(4, "Linear", "yearly"),
    on(7, "Adobe", "monthly"),
    on(10, "Notion", "yearly"),
    on(12, "iCloud", "monthly"),
    on(15, "Vercel", "monthly"),
    on(20, "Raycast", "monthly"),
    on(25, "Slack", "yearly"),
    on(28, "Figma", "monthly"),
    on(28, "Sentry", "monthly"),
    on(28, "Fly.io", "monthly"),
  ];
}
const brand = (
  day: number,
  label: string,
  domain: string,
  color: string
): PlannerEntry => ({
  id: `${label}-${day}`,
  date: new Date(2026, 0, day),
  label,
  color,
  icon: (
    <Image
      source={{
        uri: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      }}
      style={{ width: 26, height: 26, borderRadius: 6 }}
    />
  ),
});
function plannerAppEntries(month: Date): PlannerEntry[] {
  const on = (entry: PlannerEntry): PlannerEntry => ({
    ...entry,
    date: new Date(month.getFullYear(), month.getMonth(), entry.date.getDate()),
  });
  return [
    brand(3, "Netflix", "netflix.com", "#e50914"),
    brand(8, "Spotify", "spotify.com", "#1db954"),
    brand(11, "Figma", "figma.com", "#f24e1e"),
    brand(15, "YouTube", "youtube.com", "#ff0000"),
    brand(17, "Dropbox", "dropbox.com", "#0061ff"),
    brand(22, "Slack", "slack.com", "#611f69"),
    brand(28, "Linear", "linear.app", "#5e6ad2"),
  ].map(on);
}
function PlannerDayList({ entries }: { entries: PlannerEntry[] }) {
  if (entries.length === 0) {
    return (
      <Text size="sm" muted>
        Nothing renews on this day.
      </Text>
    );
  }
  return (
    <View className="gap-2">
      {entries.map((entry) => (
        <View key={entry.id} className="flex-row items-center gap-2.5">
          <View
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: PLANNER_CATEGORIES.find(
                (c) => c.id === entry.category
              )?.color,
            }}
          />
          <Text size="sm" className="flex-1">
            {entry.label}
          </Text>
          <Text size="xs" muted>
            {PLANNER_CATEGORIES.find((c) => c.id === entry.category)?.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
function PlannerDemo() {
  const [month, setMonth] = useState(() => new Date());
  return (
    <Planner
      month={month}
      onMonthChange={setMonth}
      entries={plannerEntries(month)}
      categories={PLANNER_CATEGORIES}
    >
      <Planner.Header>
        <Planner.Title />
        <Planner.Today />
        <Planner.Nav />
      </Planner.Header>
      <Planner.Grid />
      <Planner.Legend counts>
        <Planner.Summary />
      </Planner.Legend>
      <Planner.Details>
        {(_date, dayEntries) => <PlannerDayList entries={dayEntries} />}
      </Planner.Details>
    </Planner>
  );
}
function PlannerDetailsDemo() {
  const [month, setMonth] = useState(() => new Date());
  const entries = plannerEntries(month);
  return (
    <Planner
      month={month}
      onMonthChange={setMonth}
      entries={entries}
      categories={PLANNER_CATEGORIES}
    >
      <Planner.Header>
        <Planner.Title />
        <Planner.Nav />
      </Planner.Header>
      <Planner.Grid />
      <Planner.Legend />
      <Planner.Details>
        {(_date, dayEntries) => <PlannerDayList entries={dayEntries} />}
      </Planner.Details>
    </Planner>
  );
}
function PlannerBareDemo() {
  const [month, setMonth] = useState(() => new Date());
  return (
    <View className="w-full">
      <Planner
        frame={false}
        month={month}
        onMonthChange={setMonth}
        entries={plannerEntries(month)}
        categories={PLANNER_CATEGORIES}
      >
        <Planner.Grid />
      </Planner>
    </View>
  );
}
function PlannerTilesDemo() {
  const [month, setMonth] = useState(() => new Date());
  return (
    <Planner
      variant="tiles"
      month={month}
      onMonthChange={setMonth}
      entries={plannerAppEntries(month)}
    >
      <Planner.Header>
        <Planner.Title />
        <Planner.Today />
        <Planner.Nav />
      </Planner.Header>
      <Planner.Grid />
    </Planner>
  );
}
export const entry: ComponentEntry = {
  slug: "planner",
  name: "Planner",
  summary: "A month of days, each carrying what falls on it",
  demos: [
    { label: "A month of renewals", render: () => <PlannerDemo /> },
    { label: "Opening a day", render: () => <PlannerDetailsDemo /> },
    { label: "Icon tiles", render: () => <PlannerTilesDemo /> },
    { label: "Without the frame", render: () => <PlannerBareDemo /> },
  ],
};
