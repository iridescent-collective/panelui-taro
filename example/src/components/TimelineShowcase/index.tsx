import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { Timeline } from "panelui-taro/timeline";
import type { TimelineVariant } from "panelui-taro/timeline";
import { useState } from "react";

const VARIANTS: TimelineVariant[] = [
  "dot",
  "icon",
  "numbered",
  "card",
  "compact",
];
const HISTORY = Array.from({ length: 100 }, (_, index) => ({
  title: `Learning milestone ${index + 1}`,
  year: 2000 + index,
}));
export const TimelineShowcase = () => {
  const [horizontal, setHorizontal] = useState(false);
  const [variant, setVariant] = useState(0);
  const [progress, setProgress] = useState(1);
  const [column, setColumn] = useState(0);
  const [list, setList] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Timeline.Masthead label="Built for" title="Learning journey" />
      <Text size="xs">
        {JSON.stringify({
          column,
          horizontal,
          list,
          progress,
          variant: VARIANTS[variant],
        })}
      </Text>
      {list ? (
        <Timeline.List
          data={HISTORY}
          itemWidth={220}
          renderItem={({ item }) => (
            <Timeline.Item step={0}>
              <Timeline.Aside>
                <Timeline.Meta>Milestone</Timeline.Meta>
                <Timeline.Date>{item.year}</Timeline.Date>
              </Timeline.Aside>
              <Timeline.Indicator />
              <Timeline.Content>
                <Timeline.Title>{item.title}</Timeline.Title>
                <Timeline.Description>
                  A bounded history of 100 columns.
                </Timeline.Description>
              </Timeline.Content>
            </Timeline.Item>
          )}
        />
      ) : (
        <Timeline
          variant={VARIANTS[variant]}
          value={progress}
          orientation={horizontal ? "horizontal" : "vertical"}
          haptics
          onColumnChange={setColumn}
        >
          {HISTORY.slice(0, 4).map((item, index) => (
            <Timeline.Item
              key={item.year}
              step={index}
              last={index === 3}
              tone={index === 2 ? "info" : "default"}
            >
              <Timeline.Aside>
                <Timeline.Date>{item.year}</Timeline.Date>
                <Timeline.Label>Learning</Timeline.Label>
              </Timeline.Aside>
              <Timeline.Indicator>
                <Text size="xs">★</Text>
              </Timeline.Indicator>
              <Timeline.Content>
                <Timeline.Header>
                  <Timeline.Heading>
                    <Timeline.Title>{item.title}</Timeline.Title>
                  </Timeline.Heading>
                  <Timeline.Trailing>09:12</Timeline.Trailing>
                </Timeline.Header>
                <Timeline.Description>
                  Source PanelUI spacing and semantic colours.
                </Timeline.Description>
                <Timeline.Stats>
                  <Timeline.Stat label="Days" value="7" />
                  <Timeline.Stat label="Lessons" value="12" />
                </Timeline.Stats>
              </Timeline.Content>
            </Timeline.Item>
          ))}
        </Timeline>
      )}
      <Button onPress={() => setHorizontal(!horizontal)}>
        {horizontal ? "Vertical timeline" : "Horizontal timeline"}
      </Button>
      <Button onPress={() => setVariant((variant + 1) % VARIANTS.length)}>
        Next variant
      </Button>
      <Button onPress={() => setProgress((progress + 1) % 4)}>
        Advance progress
      </Button>
      <Button onPress={() => setList(!list)}>
        {list ? "Compound timeline" : "100-column list"}
      </Button>
    </View>
  );
};
