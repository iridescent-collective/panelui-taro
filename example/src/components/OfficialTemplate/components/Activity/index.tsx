import { View } from "@tarojs/components";
import { BarChart } from "panelui-taro/bar-chart";
import { RingChart } from "panelui-taro/ring-chart";
import { Tabs } from "panelui-taro/tabs";
import { useState } from "react";

import { ACTIVITY, PERIODS } from "../../constant";
import { Section } from "../Section";
import { Text } from "../Text";

export const ActivityScreen = () => {
  const [period, setPeriod] = useState(PERIODS[0]);
  const summary = ACTIVITY[PERIODS.indexOf(period)];
  const data = [
    { label: "Energy", maxValue: summary.energyGoal, value: summary.energy },
    { label: "Workout", maxValue: summary.workoutGoal, value: summary.workout },
    { label: "Steps", maxValue: summary.stepsGoal, value: summary.steps },
  ];
  return (
    <View className="flex flex-col gap-[36px]">
      <Tabs defaultValue={period} value={period} onValueChange={setPeriod}>
        <Tabs.List>
          {PERIODS.map((value) => (
            <Tabs.Trigger key={value} value={value}>
              {value}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>
      <Section
        title={
          ["Today", "Last 7 days", "Last 4 weeks"][PERIODS.indexOf(period)]
        }
        caption="Tap a ring"
      >
        <Text className="text-[44px] font-semibold">
          {Math.round((summary.energy / summary.energyGoal) * 100)}%
        </Text>
        <Text muted size="sm">
          Each ring against its own target
        </Text>
        <RingChart data={data} size={240}>
          <RingChart.Ring index={0} />
          <RingChart.Ring index={1} colorIndex={2} />
          <RingChart.Ring index={2} colorIndex={3} />
          <RingChart.Center />
        </RingChart>
        <View className="flex flex-row justify-between">
          {data.map((goal) => (
            <View key={goal.label}>
              <Text size="xs" muted>
                {goal.label}
              </Text>
              <Text weight="semibold">
                {goal.value.toLocaleString("en-US")}
              </Text>
            </View>
          ))}
        </View>
      </Section>
      <Section title="Body" caption={`This ${period.toLowerCase()}`}>
        <View className="flex flex-row justify-between">
          {[
            { label: "Resting HR", value: summary.heart },
            { label: "Sleep", value: summary.sleep },
            { label: "Distance", value: summary.distance },
          ].map((metric) => (
            <View key={metric.label} className="flex flex-col gap-[16px]">
              <Text size="xs" muted>
                {metric.label}
              </Text>
              <Text weight="semibold">{metric.value}</Text>
            </View>
          ))}
        </View>
      </Section>
      <Section title="Steps" caption="Drag to inspect">
        <BarChart
          data={summary.bars.map((steps, index) => ({
            date: `${index + 1}`,
            steps,
          }))}
        >
          <BarChart.Header
            value={summary.steps.toLocaleString("en-US")}
            caption={`${period} · steps`}
          />
          <BarChart.Grid />
          <BarChart.Bar dataKey="steps" colorIndex={3} />
          <BarChart.XAxis />
        </BarChart>
      </Section>
      <Section title="Keep showing up" caption="23 day streak">
        <Text className="text-[56px] font-semibold">23 days</Text>
        <Text size="sm" muted>
          A little progress, every single day.
        </Text>
        <View className="grid grid-cols-7 gap-[8px]">
          {Array.from({ length: 28 }, (_, index) => (
            <View
              key={`day-${index}`}
              aria-label={`Day ${index + 1}: ${index < 23 ? "workout" : "rest"}`}
              className={`h-[36px] rounded-[8px] ${index < 23 ? "bg-[var(--panel-success)]" : "bg-[var(--panel-muted)]"}`}
            />
          ))}
        </View>
      </Section>
    </View>
  );
};
