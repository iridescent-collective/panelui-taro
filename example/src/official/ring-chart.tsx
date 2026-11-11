import { Frame } from "panelui-taro/frame";
import { Text } from "panelui-taro/primitives/text";
import { RingChart, type RingDatum } from "panelui-taro/ring-chart";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const GOALS: RingDatum[] = [
  { label: "Move", value: 486, maxValue: 600 },
  { label: "Exercise", value: 24, maxValue: 30 },
  { label: "Stand", value: 9, maxValue: 12 },
];
const CHART_HEADER = "px-4 pt-3.5";
const percentOf = (ring: RingDatum) =>
  ring.maxValue > 0 ? Math.round((ring.value / ring.maxValue) * 100) : 0;
const RING_SIZE = 208;
function RingChartGoalsVersion() {
  const [active, setActive] = useState(-1);
  const ring = active >= 0 ? GOALS[active] : null;
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Today</Frame.Title>
          <Frame.Action>Tap a ring</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <RingChart
            data={GOALS}
            size={RING_SIZE}
            strokeWidth={16}
            ringGap={6}
            className="pb-4"
            activeIndex={active}
            onActiveIndexChange={setActive}
          >
            <RingChart.Header
              className={CHART_HEADER}
              value={`${percentOf(ring ?? GOALS[0]!)}%`}
              caption={
                ring
                  ? `${ring.label} · ${ring.value} of ${ring.maxValue}`
                  : "Each ring against its own target"
              }
              legend
            />
            {GOALS.map((goal, index) => (
              <RingChart.Ring key={goal.label} index={index} />
            ))}
            <RingChart.Center defaultLabel="Move" />
          </RingChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
const HEALTH: RingDatum[] = [{ label: "Health", value: 82, maxValue: 100 }];
function RingChartGaugeVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Index health</Frame.Title>
          <Frame.Action>Last run 4m ago</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <RingChart
            data={HEALTH}
            size={RING_SIZE}
            startAngle={-135}
            endAngle={135}
            strokeWidth={18}
            className="pb-4"
          >
            <RingChart.Header
              className={CHART_HEADER}
              title="Score"
              value="82 of 100"
              caption="Above the 75 the alerting is set at"
            />
            <RingChart.Ring index={0} colorIndex={2} />
            <RingChart.Center
              formatValue={(value) => `${value}`}
              defaultLabel="Healthy"
            />
          </RingChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
const COURSE_SESSIONS: RingDatum[] = [
  { label: "Sessions", value: 8, maxValue: 12 },
];
function RingChartSegmentedVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Course progress</Frame.Title>
          <Frame.Action>Spring cohort</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <RingChart
            data={COURSE_SESSIONS}
            size={RING_SIZE}
            strokeWidth={16}
            className="pb-4"
          >
            <RingChart.Header
              className={CHART_HEADER}
              title="Sessions attended"
              value="8 of 12"
              caption="Four left before the assessment"
            />
            <RingChart.Ring
              index={0}
              segments={12}
              segmentGap={6}
              colorIndex={4}
            />
            <RingChart.Center formatValue={(value) => `${value}`} />
          </RingChart>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
const BUDGETS: RingDatum[] = [
  { label: "Compute", value: 412, maxValue: 500 },
  { label: "Storage", value: 96, maxValue: 400 },
  { label: "Egress", value: 268, maxValue: 300 },
];
function RingChartTilesVersion() {
  return (
    <View className="flex-1 justify-center p-4">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Monthly budgets</Frame.Title>
          <Frame.Action>8 days left</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <View className="flex-row items-start justify-around p-4">
            {BUDGETS.map((budget, index) => (
              <View key={budget.label} className="items-center gap-1.5">
                <RingChart
                  data={[budget]}
                  size={92}
                  strokeWidth={9}
                  startAngle={-120}
                  endAngle={120}
                >
                  <RingChart.Ring
                    index={0}
                    colorIndex={((index % 5) + 1) as 1 | 2 | 3 | 4 | 5}
                  />
                  <RingChart.Center
                    formatValue={() => `${percentOf(budget)}%`}
                  />
                </RingChart>
                <Text size="xs" weight="medium">
                  {budget.label}
                </Text>
                <Text size="xs" muted>
                  {budget.value} of {budget.maxValue}
                </Text>
              </View>
            ))}
          </View>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "ring-chart",
  name: "RingChart",
  summary: "Concentric arcs, each against its own target",
  layout: "pager",
  demos: [
    {
      label: "Today's goals",
      id: "goals",
      fullPage: true,
      description:
        "Three targets, each read against its own rather than each other.",
      render: () => <RingChartGoalsVersion />,
    },
    {
      label: "Gauge",
      id: "gauge",
      fullPage: true,
      description:
        "The ring opened to three quarters of a turn, notch at the bottom.",
      render: () => <RingChartGaugeVersion />,
    },
    {
      label: "Segmented",
      id: "segmented",
      fullPage: true,
      description:
        "Ticks rather than an arc, for a target made of countable things.",
      render: () => <RingChartSegmentedVersion />,
    },
    {
      label: "Separate dials",
      id: "tiles",
      fullPage: true,
      description:
        "Three charts rather than three rings, when nothing is read against anything.",
      render: () => <RingChartTilesVersion />,
    },
  ],
};
