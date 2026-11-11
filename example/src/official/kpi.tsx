import Dollar01Icon from "@hugeicons/core-free-icons/Dollar01Icon";
import { Frame } from "panelui-taro/frame";
import { CrosshairIcon } from "panelui-taro/icons";
import { Kpi } from "panelui-taro/kpi";
import { Text } from "panelui-taro/primitives/text";
import { Progress } from "panelui-taro/progress";
import { Surface } from "panelui-taro/surface";
import { type ReactNode } from "react";

import { HugeiconsIcon } from "../runtime/icons";
import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function spark(values: number[]): {
  t: string;
  v: number;
}[] {
  return values.map((v, index) => ({ t: String(index), v }));
}
function ChartScreen({ children }: { children: ReactNode }) {
  return <View className="flex-1 justify-center px-4">{children}</View>;
}
const KPI_ROW = "px-4 py-3.5";
function KpiDefaultVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Overview</Frame.Title>
          <Frame.Action>Last 30 days</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Frame.Section className={KPI_ROW}>
            <Kpi surface={false} colorIndex={1}>
              <Kpi.Content layout="inline">
                <Kpi.Stat>
                  <Kpi.Title>Total Revenue</Kpi.Title>
                  <Kpi.Value>$317,904</Kpi.Value>
                  <Kpi.Trend value={7.8} caption="last 30d" />
                </Kpi.Stat>
                <Kpi.Chart
                  data={spark([36, 39, 47, 44, 55, 63, 61, 76, 88])}
                  dataKey="v"
                  inline
                />
              </Kpi.Content>
            </Kpi>
          </Frame.Section>

          <Frame.Section className={KPI_ROW}>
            <Kpi surface={false} colorIndex={3} goodDirection="down">
              <Kpi.Content layout="inline">
                <Kpi.Stat>
                  <Kpi.Title>Bounce Rate</Kpi.Title>
                  <Kpi.Value>37.6%</Kpi.Value>
                  <Kpi.Trend value={-8.4} caption="vs last 7d" />
                </Kpi.Stat>
                <Kpi.Chart
                  data={spark([88, 85, 73, 76, 64, 59, 61, 48, 39])}
                  dataKey="v"
                  inline
                />
              </Kpi.Content>
            </Kpi>
          </Frame.Section>

          <Frame.Section className={KPI_ROW}>
            <Kpi surface={false} colorIndex={2}>
              <Kpi.Content layout="inline">
                <Kpi.Stat>
                  <Kpi.Title>New Customers</Kpi.Title>
                  <Kpi.Value>2,867</Kpi.Value>
                  <Kpi.Trend value={4.2} caption="this week" />
                </Kpi.Stat>
                <Kpi.Chart
                  data={spark([27, 35, 33, 46, 59, 55, 64, 79, 91])}
                  dataKey="v"
                  inline
                />
              </Kpi.Content>
            </Kpi>
          </Frame.Section>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function KpiSparklineVersion() {
  return (
    <ChartScreen>
      <View className="w-full gap-3">
        <Kpi colorIndex={1}>
          <Kpi.Header>
            <Kpi.Title>Total revenue</Kpi.Title>
          </Kpi.Header>
          <Kpi.Content>
            <Kpi.Value>$317,904</Kpi.Value>
            <Kpi.Trend value={7.8} />
          </Kpi.Content>
          <Kpi.Chart
            data={spark([36, 39, 47, 44, 55, 63, 61, 76, 88])}
            dataKey="v"
          />
        </Kpi>

        <Kpi colorIndex={2}>
          <Kpi.Header>
            <Kpi.Title>New customers</Kpi.Title>
          </Kpi.Header>
          <Kpi.Content layout="inline">
            <View>
              <Kpi.Value>2,867</Kpi.Value>
              <Kpi.Trend value={4.2} className="mt-1 self-start" />
            </View>
            <Kpi.Chart
              data={spark([27, 35, 33, 46, 59, 55, 64, 79, 91])}
              dataKey="v"
              inline
            />
          </Kpi.Content>
        </Kpi>
      </View>
    </ChartScreen>
  );
}
function KpiProgressVersion() {
  return (
    <ChartScreen>
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Targets</Frame.Title>
          <Frame.Action>Q3</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Frame.Section className={KPI_ROW}>
            <Kpi surface={false} colorIndex={4}>
              <Kpi.Header>
                <Kpi.Icon tone="good">
                  <CrosshairIcon size={16} color="#27a644" />
                </Kpi.Icon>
                <Kpi.Title>Quarterly revenue</Kpi.Title>
                <Kpi.Trend value={7.8} variant="badge" />
              </Kpi.Header>
              <Kpi.Value>$317k</Kpi.Value>
              <Kpi.Progress value={73} label="of $435k" showValueLabel />
              <Kpi.Footer>
                <Text size="xs" muted>
                  41 days left in the quarter
                </Text>
              </Kpi.Footer>
            </Kpi>
          </Frame.Section>
          <Frame.Section className={KPI_ROW}>
            <Kpi surface={false} colorIndex={2}>
              <Kpi.Header>
                <Kpi.Icon>
                  <HugeiconsIcon
                    icon={Dollar01Icon}
                    size={16}
                    color="#8a8f98"
                  />
                </Kpi.Icon>
                <Kpi.Title>New customers</Kpi.Title>
                <Kpi.Trend value={4.2} variant="badge" />
              </Kpi.Header>
              <Kpi.Value>2,867</Kpi.Value>
              <Kpi.Progress value={57} label="of 5,000" showValueLabel />
            </Kpi>
          </Frame.Section>
        </Frame.Panel>
      </Frame>
    </ChartScreen>
  );
}
function KpiGroupVersion() {
  return (
    <ChartScreen>
      <View className="w-full gap-6">
        <Surface variant="secondary" padding="lg">
          <Kpi.Group>
            <Kpi surface={false} colorIndex={1}>
              <Kpi.Title>Revenue</Kpi.Title>
              <Kpi.Value className="text-2xl">$317k</Kpi.Value>
              <Kpi.Trend value={7.8} className="self-start" />
            </Kpi>
            <Kpi surface={false} colorIndex={2}>
              <Kpi.Title>Orders</Kpi.Title>
              <Kpi.Value className="text-2xl">2,867</Kpi.Value>
              <Kpi.Trend value={4.2} className="self-start" />
            </Kpi>
            <Kpi surface={false} colorIndex={3} goodDirection="down">
              <Kpi.Title>Refunds</Kpi.Title>
              <Kpi.Value className="text-2xl">1.4%</Kpi.Value>
              <Kpi.Trend value={-0.3} className="self-start" />
            </Kpi>
          </Kpi.Group>
        </Surface>

        <Surface variant="secondary" padding="lg">
          <Kpi.Group orientation="vertical">
            <Kpi surface={false} colorIndex={1}>
              <Kpi.Content layout="inline">
                <View>
                  <Kpi.Title>Sessions</Kpi.Title>
                  <Kpi.Value className="text-2xl">48,201</Kpi.Value>
                </View>
                <Kpi.Trend value={12.4} />
              </Kpi.Content>
            </Kpi>
            <Kpi surface={false} colorIndex={3} goodDirection="down">
              <Kpi.Content layout="inline">
                <View>
                  <Kpi.Title>Latency p95</Kpi.Title>
                  <Kpi.Value className="text-2xl">312ms</Kpi.Value>
                </View>
                <Kpi.Trend value={-6.1} />
              </Kpi.Content>
            </Kpi>
          </Kpi.Group>
        </Surface>
      </View>
    </ChartScreen>
  );
}
export const entry: ComponentEntry = {
  slug: "kpi",
  name: "Kpi",
  summary: "One number, and what it is doing",
  layout: "pager",
  demos: [
    {
      label: "Default",
      id: "default",
      fullPage: true,
      description:
        "Number and change on the left, the shape it made on the right.",
      render: () => <KpiDefaultVersion />,
    },
    {
      label: "With a sparkline",
      id: "sparkline",
      fullPage: true,
      description: "The shape under the number, and the shape beside it.",
      render: () => <KpiSparklineVersion />,
    },
    {
      label: "With progress",
      id: "progress",
      fullPage: true,
      description:
        "Targets, with an icon, a badge and a bar under each number.",
      render: () => <KpiProgressVersion />,
    },
    {
      label: "Several as one panel",
      id: "group",
      fullPage: true,
      description:
        "Divided by a rule rather than spaced apart, in a row and a column.",
      render: () => <KpiGroupVersion />,
    },
  ],
};
