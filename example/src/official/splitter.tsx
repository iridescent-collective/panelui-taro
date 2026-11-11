import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { Splitter } from "panelui-taro/splitter";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function Pane({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <View className={`h-full gap-1 p-4 ${className ?? ""}`}>
      <Text weight="medium">{title}</Text>
      <Text size="sm" muted>
        {body}
      </Text>
    </View>
  );
}
function SplitterCollapsibleDemo() {
  const [layout, setLayout] = useState([32, 68]);
  const shut = (layout[0] ?? 0) < 1;
  return (
    <View className="w-full gap-3">
      <Splitter
        className="border-border h-56 overflow-hidden rounded-2xl border"
        defaultLayout={[32, 68]}
        onLayoutChange={setLayout}
      >
        <Splitter.Panel
          minSize={22}
          collapsible
          className="bg-surface-secondary"
        >
          <Pane title="Folders" body="Drag the seam left to shut this." />
        </Splitter.Panel>
        <Splitter.Handle />
        <Splitter.Panel minSize={40}>
          <Pane title="Messages" body="Double-tap the seam to put it back." />
        </Splitter.Panel>
      </Splitter>
      <Text size="sm" muted>
        {shut
          ? "Sidebar shut — double-tap the seam to bring it back."
          : `Sidebar ${Math.round(layout[0] ?? 0)}%, messages ${Math.round(layout[1] ?? 0)}%.`}
      </Text>
    </View>
  );
}
function SplitterControlledDemo() {
  const [layout, setLayout] = useState([50, 50]);
  return (
    <View className="w-full gap-3">
      <Splitter
        className="border-border h-48 overflow-hidden rounded-2xl border"
        layout={layout}
        onLayoutChange={setLayout}
      >
        <Splitter.Panel minSize={20}>
          <Pane title="Before" body={`${Math.round(layout[0] ?? 0)}%`} />
        </Splitter.Panel>
        <Splitter.Handle />
        <Splitter.Panel minSize={20} className="bg-surface-secondary">
          <Pane title="After" body={`${Math.round(layout[1] ?? 0)}%`} />
        </Splitter.Panel>
      </Splitter>
      <Button variant="outline" onPress={() => setLayout([50, 50])}>
        Even split
      </Button>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "splitter",
  name: "Splitter",
  summary: "Panes sharing a container, with a seam you can drag",
  demos: [
    {
      label: "Two panes",
      render: () => (
        <View className="w-full">
          <Splitter
            className="border-border h-56 overflow-hidden rounded-2xl border"
            defaultLayout={[60, 40]}
          >
            <Splitter.Panel minSize={25} className="bg-surface-secondary">
              <Pane title="Inbox" body="12 conversations" />
            </Splitter.Panel>
            <Splitter.Handle />
            <Splitter.Panel minSize={25}>
              <Pane title="Thread" body="Pick a conversation to read it." />
            </Splitter.Panel>
          </Splitter>
        </View>
      ),
    },
    {
      label: "A pane that can be shut",
      render: () => <SplitterCollapsibleDemo />,
    },
    {
      label: "Stacked panes",
      render: () => (
        <Splitter
          orientation="vertical"
          className="border-border h-72 overflow-hidden rounded-2xl border"
          defaultLayout={[45, 55]}
        >
          <Splitter.Panel minSize={20}>
            <Pane title="Preview" body="What the reader will see." />
          </Splitter.Panel>
          <Splitter.Handle />
          <Splitter.Panel minSize={20} className="bg-surface-secondary">
            <Pane title="Source" body="What you are writing." />
          </Splitter.Panel>
        </Splitter>
      ),
    },
    {
      label: "Three panes",
      render: () => (
        <View className="w-full">
          <Splitter
            className="border-border h-56 overflow-hidden rounded-2xl border"
            defaultLayout={[25, 50, 25]}
          >
            <Splitter.Panel minSize={15} className="bg-surface-secondary">
              <Pane title="Files" body="8" />
            </Splitter.Panel>
            <Splitter.Handle />
            <Splitter.Panel minSize={30}>
              <Pane title="Editor" body="index.tsx" />
            </Splitter.Panel>
            <Splitter.Handle />
            <Splitter.Panel minSize={15} className="bg-surface-secondary">
              <Pane title="Outline" body="4 symbols" />
            </Splitter.Panel>
          </Splitter>
        </View>
      ),
    },
    { label: "Keeping the layout", render: () => <SplitterControlledDemo /> },
    {
      label: "Frozen",
      render: () => (
        <View className="w-full">
          <Splitter
            disabled
            className="border-border h-40 overflow-hidden rounded-2xl border"
            defaultLayout={[70, 30]}
          >
            <Splitter.Panel>
              <Pane title="Fixed" body="The seam is frozen." />
            </Splitter.Panel>
            <Splitter.Handle />
            <Splitter.Panel className="bg-surface-secondary">
              <Pane title="Also fixed" body="" />
            </Splitter.Panel>
          </Splitter>
        </View>
      ),
    },
  ],
};
