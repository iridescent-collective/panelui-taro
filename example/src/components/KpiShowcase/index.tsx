import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { ArrowUpIcon } from "panelui-taro/icons";
import { Kpi } from "panelui-taro/kpi";
import type { KpiGoodDirection } from "panelui-taro/kpi";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const DATA = [
  { v: 14 },
  { v: 20 },
  { v: 18 },
  { v: 30 },
  { v: 24 },
  { v: 38 },
  { v: 42 },
];
export const KpiShowcase = () => {
  const [direction, setDirection] = useState<KpiGoodDirection>("up");
  const [trend, setTrend] = useState(12.4);
  const [badge, setBadge] = useState(false);
  const [vertical, setVertical] = useState(false);
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography id="panel-kpi-result">
        {JSON.stringify({ badge, direction, trend, vertical })}
      </Typography>
      <Kpi id="panel-kpi-main" goodDirection={direction} colorIndex={2}>
        <Kpi.Header>
          <Kpi.Icon>
            <ArrowUpIcon />
          </Kpi.Icon>
          <Kpi.Title>Reading time</Kpi.Title>
          <Kpi.Actions>
            <Typography muted>This week</Typography>
          </Kpi.Actions>
        </Kpi.Header>
        <Kpi.Content layout="inline">
          <Kpi.Stat>
            <Kpi.Value>42 min</Kpi.Value>
            <Kpi.Trend
              value={trend}
              variant={badge ? "badge" : "text"}
              caption="vs week"
            />
          </Kpi.Stat>
          <Kpi.Chart inline data={DATA} dataKey="v" />
        </Kpi.Content>
        <Kpi.Progress
          value={42}
          maxValue={60}
          label="Daily goal"
          showValueLabel
        />
        <Kpi.Separator />
        <Kpi.Footer>
          <Typography muted>Daily learning</Typography>
        </Kpi.Footer>
      </Kpi>
      <Kpi.Group orientation={vertical ? "vertical" : "horizontal"}>
        <Kpi surface={false}>
          <Kpi.Title>Visits</Kpi.Title>
          <Kpi.Value>124</Kpi.Value>
          <Kpi.Trend value={-4.2} variant="badge" />
          <Kpi.Chart data={DATA} dataKey="v" height={56} />
        </Kpi>
        <Kpi surface={false} goodDirection="down">
          <Kpi.Title>Missed tasks</Kpi.Title>
          <Kpi.Value>3</Kpi.Value>
          <Kpi.Trend value={-4.2} variant="badge" />
          <Kpi.Chart data={DATA} dataKey="v" colorIndex={2} filled={false} />
        </Kpi>
      </Kpi.Group>
      <Button
        id="panel-kpi-polarity"
        variant="outline"
        onPress={() =>
          setDirection((value) => (value === "up" ? "down" : "up"))
        }
      >
        Good direction: {direction}
      </Button>
      <Button
        id="panel-kpi-sign"
        variant="outline"
        onPress={() =>
          setTrend((value) => {
            if (value === 0) {
              return 12.4;
            }
            return value > 0 ? -4.2 : 0;
          })
        }
      >
        Change trend
      </Button>
      <Button
        id="panel-kpi-badge"
        variant="outline"
        onPress={() => setBadge((value) => !value)}
      >
        Toggle badge
      </Button>
      <Button
        id="panel-kpi-group"
        variant="outline"
        onPress={() => setVertical((value) => !value)}
      >
        Toggle group orientation
      </Button>
    </View>
  );
};
