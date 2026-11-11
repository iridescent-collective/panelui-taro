import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { AudioLinesIcon, BookIcon } from "panelui-taro/icons";
import { Planner } from "panelui-taro/planner";
import type { PlannerVariant } from "panelui-taro/planner";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

const VARIANTS: PlannerVariant[] = ["default", "tiles", "calendar"];
const ENTRIES = [
  {
    category: "lesson",
    date: new Date(2026, 9, 14, 9),
    icon: <BookIcon size={22} />,
    id: "read",
    label: "Reading",
  },
  {
    category: "activity",
    date: new Date(2026, 9, 14, 15),
    icon: <AudioLinesIcon size={22} />,
    id: "song",
    label: "Music",
  },
  {
    category: "activity",
    date: new Date(2026, 9, 20),
    icon: <BookIcon size={22} />,
    id: "trip",
    label: "Museum",
  },
];
const CATEGORIES = [
  { id: "lesson", label: "Lessons" },
  { colorIndex: 4, id: "activity", label: "Activities" },
];
export const PlannerShowcase = () => {
  const [variant, setVariant] = useState(0);
  const [scroller, setScroller] = useState(false);
  const [selected, setSelected] = useState<Date | null>(null);
  return (
    <View className="flex flex-col gap-[24px]">
      <View
        className={
          scroller || variant === 2 ? "flex h-[900px] flex-col" : "w-full"
        }
      >
        <Planner
          defaultMonth={new Date(2026, 9, 1)}
          entries={ENTRIES}
          categories={CATEGORIES}
          variant={VARIANTS[variant]}
          fill={scroller || variant === 2}
          locale="en-US"
          selected={selected}
          onSelectedChange={setSelected}
        >
          <Planner.Header>
            <Planner.Title />
            <Planner.Today />
            <Planner.Nav />
          </Planner.Header>
          {scroller ? <Planner.Scroller /> : <Planner.Grid />}
          <Planner.Legend counts>
            <Planner.Summary />
          </Planner.Legend>
          <Planner.Details>
            {(date, entries) => (
              <View className="flex flex-col gap-[16px]">
                <Text size="sm">{date.toDateString()}</Text>
                {entries.map((entry) => (
                  <Text key={entry.id}>{entry.label}</Text>
                ))}
              </View>
            )}
          </Planner.Details>
        </Planner>
      </View>
      <Text size="xs">
        {JSON.stringify({
          scroller,
          selected: selected?.toDateString() ?? null,
          variant: VARIANTS[variant],
        })}
      </Text>
      <Button onPress={() => setVariant((variant + 1) % VARIANTS.length)}>
        Next planner variant
      </Button>
      <Button onPress={() => setScroller(!scroller)}>
        {scroller ? "Month grid" : "Scrolling weeks"}
      </Button>
    </View>
  );
};
