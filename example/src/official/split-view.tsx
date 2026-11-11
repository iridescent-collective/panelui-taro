import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Text } from "panelui-taro/primitives/text";
import { SplitView } from "panelui-taro/split-view";
import { useState } from "react";

import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
function Half({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <View className={`flex-1 justify-center gap-1 p-4 ${className ?? ""}`}>
      <Text weight="medium">{title}</Text>
      <Text size="sm" muted>
        {body}
      </Text>
    </View>
  );
}
const NOTES = [
  "The pane clips what does not fit.",
  "So anything longer than the shortest snap point brings its own scroller.",
  "A ScrollView here behaves like any other scroller in a box whose height changes.",
  "Drag the seam down and this list gets more of the room.",
  "Drag it up and the list keeps scrolling in what is left.",
  "Nothing about the scroll position changes when the pane does.",
];
function SplitViewControlledDemo() {
  const [index, setIndex] = useState(1);
  return (
    <View className="w-full gap-3">
      <SplitView
        className="border-border h-80 overflow-hidden rounded-2xl border"
        snapIndex={index}
        onSnapIndexChange={setIndex}
      >
        <SplitView.Top>
          <Half
            title="Preview"
            body={`Snap ${index + 1} of 3.`}
            className="bg-surface-secondary"
          />
        </SplitView.Top>
        <SplitView.DragArea>
          <SplitView.Handle />
        </SplitView.DragArea>
        <SplitView.Bottom>
          <Half title="Source" body="What you are writing." />
        </SplitView.Bottom>
      </SplitView>
      <Button variant="outline" onPress={() => setIndex(0)}>
        Collapse the preview
      </Button>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "split-view",
  name: "SplitView",
  summary: "Two resizable stacked panes that settle on a named height",
  demos: [
    {
      label: "A pane at three heights",
      render: () => (
        <View className="w-full">
          <SplitView className="h-96">
            <SplitView.Top>
              <Half title="Map" body="Drag the handle down for more of it." />
            </SplitView.Top>
            <SplitView.DragArea>
              <SplitView.Handle />
            </SplitView.DragArea>
            <SplitView.Bottom>
              <Half title="Results" body="8 places nearby." />
            </SplitView.Bottom>
          </SplitView>
        </View>
      ),
    },
    {
      label: "Naming the heights",
      render: () => (
        <View className="w-full">
          <SplitView
            className="h-96"
            snapPoints={[0.3, 0.75]}
            minHeight={96}
            defaultSnapIndex={0}
          >
            <SplitView.Top>
              <Half
                title="Preview"
                body="Two heights, and a floor of 96 points."
              />
            </SplitView.Top>
            <SplitView.DragArea>
              <SplitView.Handle />
            </SplitView.DragArea>
            <SplitView.Bottom>
              <Half title="Editor" body="index.tsx" />
            </SplitView.Bottom>
          </SplitView>
        </View>
      ),
    },
    {
      label: "Content that scrolls inside a pane",
      render: () => (
        <View className="w-full">
          <SplitView className="h-96" snapPoints={[0.35, 0.8]}>
            <SplitView.Top>
              <ScrollView contentContainerClassName="gap-2 p-4">
                {NOTES.map((note) => (
                  <Text key={note} size="sm">
                    {note}
                  </Text>
                ))}
              </ScrollView>
            </SplitView.Top>
            <SplitView.DragArea>
              <SplitView.Handle />
            </SplitView.DragArea>
            <SplitView.Bottom>
              <Half title="Detail" body="Takes whatever the list gave up." />
            </SplitView.Bottom>
          </SplitView>
        </View>
      ),
    },
    {
      label: "A seam instead of two surfaces",
      render: () => (
        <View className="w-full">
          <Card>
            <Card.Content className="p-0">
              <SplitView
                variant="seam"
                className="h-72"
                snapPoints={[0.4, 0.7]}
              >
                <SplitView.Top>
                  <Half title="Chart" body="No surface of its own." />
                </SplitView.Top>
                <SplitView.DragArea>
                  <SplitView.Handle />
                </SplitView.DragArea>
                <SplitView.Bottom>
                  <Half title="Legend" body="The card is the surface." />
                </SplitView.Bottom>
              </SplitView>
            </Card.Content>
          </Card>
        </View>
      ),
    },
    {
      label: "Driving it from outside",
      render: () => <SplitViewControlledDemo />,
    },
    {
      label: "A seam that does not move",
      render: () => (
        <View className="w-full">
          <SplitView className="h-72" snapPoints={[0.5]} disabled>
            <SplitView.Top>
              <Half title="Fixed" body="The seam is frozen." />
            </SplitView.Top>
            <SplitView.DragArea>
              <SplitView.Handle />
            </SplitView.DragArea>
            <SplitView.Bottom>
              <Half title="Also fixed" body="" />
            </SplitView.Bottom>
          </SplitView>
        </View>
      ),
    },
  ],
};
