import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { CodeBlock } from "panelui-taro/code-block";
import { Item } from "panelui-taro/item";
import { Message } from "panelui-taro/message";
import { MessageScroller } from "panelui-taro/message-scroller";
import { Plan } from "panelui-taro/plan";
import { Text } from "panelui-taro/primitives/text";
import { Reasoning } from "panelui-taro/reasoning";
import { Shimmer } from "panelui-taro/shimmer";
import { Sources } from "panelui-taro/sources";
import { Task } from "panelui-taro/task";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const REASONING_TRACE = `The band is drawn per cell, so each one has to know whether the range carries on past its own edge.

The old rule only asked "am I between the two ends", which leaves the ends themselves with no band at all — hence the gap on either side of the disc.

Making the test inclusive and giving each end half a cell should close it.`;
const AI_PATCH = `@@ calendar/index.tsx
-  const inRange = !!range?.to && isWithin(date, range.from, range.to) && !selected;
+  const inRange = !!range?.to && isWithin(date, range.from, range.to);`;
function ReasoningStreamDemo() {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const run = () => {
    setText("");
    setStreaming(true);
    let cursor = 0;
    const timer = setInterval(() => {
      cursor += 12;
      setText(REASONING_TRACE.slice(0, cursor));
      if (cursor >= REASONING_TRACE.length) {
        clearInterval(timer);
        setStreaming(false);
      }
    }, 60);
  };
  return (
    <View className="w-full gap-4">
      <Reasoning isStreaming={streaming}>
        <Reasoning.Trigger />
        <Reasoning.Content>{text || REASONING_TRACE}</Reasoning.Content>
      </Reasoning>
      <Button variant="outline" onPress={run} disabled={streaming}>
        {streaming ? "Thinking…" : "Stream a trace"}
      </Button>
    </View>
  );
}
function ReasoningInTurnDemo() {
  return (
    <Message align="start">
      <Message.Content>
        <Reasoning defaultOpen={false} duration={6}>
          <Reasoning.Trigger />
          <Reasoning.Content>{REASONING_TRACE}</Reasoning.Content>
        </Reasoning>
        <Message.Bubble>
          <Message.BubbleContent>
            The gap was the inclusive test — both ends were excluded from the
            band, so neither carried its half of it.
          </Message.BubbleContent>
        </Message.Bubble>
      </Message.Content>
    </Message>
  );
}
const AI_SOURCES = [
  { url: "https://expo.dev/changelog/sdk-57", title: "Expo SDK 57" },
  {
    url: "https://reactnative.dev/blog/new-architecture",
    title: "The New Architecture",
  },
  {
    url: "https://docs.swmansion.com/react-native-reanimated/",
    title: undefined,
  },
];
function PlanWithTasksDemo() {
  return (
    <Plan>
      <Plan.Header>
        <Plan.Title>Fix the calendar range</Plan.Title>
        <Plan.Action>
          <Badge variant="secondary">2 of 3</Badge>
          <Plan.Trigger />
        </Plan.Action>
      </Plan.Header>
      <Plan.Content>
        <Task status="complete">
          <Task.Trigger title="Make the test inclusive" />
          <Task.Content>
            <Task.Item>
              Edited <Task.File>calendar/index.tsx</Task.File>
            </Task.Item>
          </Task.Content>
        </Task>
        <Task status="complete">
          <Task.Trigger title="Round only where it stops" />
          <Task.Content>
            <Task.Item>Four corners, from openStart and openEnd.</Task.Item>
          </Task.Content>
        </Task>
        <Task status="running">
          <Task.Trigger title="Regenerate the docs" />
          <Task.Content>
            <Task.Item>Running docs:generate…</Task.Item>
          </Task.Content>
        </Task>
      </Plan.Content>
    </Plan>
  );
}
function AgentTranscriptDemo() {
  return (
    <MessageScroller className="flex-1">
      <MessageScroller.Viewport>
        <MessageScroller.Content className="gap-4 px-5 py-6">
          <MessageScroller.Item messageId="ask">
            <Message align="end">
              <Message.Content>
                <Message.Bubble>
                  <Message.BubbleContent>
                    The calendar range has a gap at each end. Can you fix it?
                  </Message.BubbleContent>
                </Message.Bubble>
              </Message.Content>
            </Message>
          </MessageScroller.Item>

          <MessageScroller.Item messageId="plan">
            <PlanWithTasksDemo />
          </MessageScroller.Item>

          <MessageScroller.Item messageId="answer">
            <Message align="start">
              <Message.Content>
                <Reasoning defaultOpen={false} duration={6}>
                  <Reasoning.Trigger />
                  <Reasoning.Content>{REASONING_TRACE}</Reasoning.Content>
                </Reasoning>
                <Message.Bubble>
                  <Message.BubbleContent>
                    Both ends were excluded from the band, so neither carried
                    its half of it. One character:
                  </Message.BubbleContent>
                </Message.Bubble>
                <CodeBlock code={AI_PATCH} language="diff">
                  <CodeBlock.Header>
                    <CodeBlock.Language>diff</CodeBlock.Language>
                    <CodeBlock.Actions>
                      <CodeBlock.CopyButton />
                    </CodeBlock.Actions>
                  </CodeBlock.Header>
                </CodeBlock>
                <Sources>
                  <Sources.Trigger count={AI_SOURCES.length} />
                  <Sources.Content>
                    {AI_SOURCES.map((source) => (
                      <Sources.Source
                        key={source.url}
                        href={source.url}
                        title={source.title}
                      />
                    ))}
                  </Sources.Content>
                </Sources>
              </Message.Content>
            </Message>
          </MessageScroller.Item>
        </MessageScroller.Content>
      </MessageScroller.Viewport>
    </MessageScroller>
  );
}
export const entry: ComponentEntry = {
  slug: "reasoning",
  name: "Reasoning",
  summary: "The model's working, shown while it happens",
  demos: [
    { label: "A live trace", render: () => <ReasoningStreamDemo /> },
    { label: "In a turn", render: () => <ReasoningInTurnDemo /> },
    {
      label: "Words of your own",
      render: () => (
        <Reasoning defaultOpen duration={9}>
          <Reasoning.Trigger
            label={(streaming, duration) =>
              streaming ? (
                <Shimmer>Working through it…</Shimmer>
              ) : (
                <Text size="sm" muted>
                  Reasoned for {duration}s
                </Text>
              )
            }
          />
          <Reasoning.Content>{REASONING_TRACE}</Reasoning.Content>
        </Reasoning>
      ),
    },
    {
      label: "The whole turn",
      id: "transcript",
      fullPage: true,
      description:
        "A plan, its steps, the reasoning, the answer, its code and its sources.",
      render: () => <AgentTranscriptDemo />,
    },
  ],
};
