import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import {
  PlusIcon,
  RotateCcwIcon,
  TrashIcon,
} from "panelui-taro/icons";
import { StackCard } from "panelui-taro/stack-card";
import type {
  StackCardHandle,
  StackCardLayout,
} from "panelui-taro/stack-card";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

const DECK = [
  "Read together",
  "Practice words",
  "Listen to stories",
  "Review the day",
];
const LAYOUT_NEXT = { fan: "flat", flat: "stack", stack: "fan" } as const;
export const StackCardShowcase = () => {
  const handle = useRef<StackCardHandle>(null);
  const [layout, setLayout] = useState<StackCardLayout>("stack");
  const [index, setIndex] = useState(0);
  const [swipe, setSwipe] = useState("");
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography id="panel-stack-card-result">
        {JSON.stringify({ index, layout, swipe })}
      </Typography>
      <Button variant="outline" onPress={() => setLayout(LAYOUT_NEXT[layout])}>
        Layout: {layout}
      </Button>
      <StackCard
        ref={handle}
        index={index}
        onIndexChange={setIndex}
        onSwipe={(direction, from) => setSwipe(`${direction}:${from}`)}
        layout={layout}
        className="h-[800px]"
      >
        {DECK.map((title, position) => (
          <StackCard.Card
            key={title}
            className="flex flex-col items-center justify-center gap-[24px] p-[48px]"
          >
            <Typography>
              {position + 1} / {DECK.length}
            </Typography>
            <Typography.Heading type="h3">{title}</Typography.Heading>
          </StackCard.Card>
        ))}
        <StackCard.Stamp direction="left" color="destructive">
          Later
        </StackCard.Stamp>
        <StackCard.Stamp direction="right" color="success">
          Yes
        </StackCard.Stamp>
        <StackCard.Empty>
          <Typography>Deck complete</Typography>
        </StackCard.Empty>
        <StackCard.Actions>
          <StackCard.Action
            action="left"
            color="destructive"
            icon={<TrashIcon />}
          />
          <StackCard.Action
            action="undo"
            label="Undo"
            icon={<RotateCcwIcon />}
          />
          <StackCard.Action
            action="right"
            color="success"
            icon={<PlusIcon />}
          />
        </StackCard.Actions>
      </StackCard>
      <Button variant="outline" onPress={() => handle.current?.reset()}>
        Reset deck
      </Button>
    </View>
  );
};
