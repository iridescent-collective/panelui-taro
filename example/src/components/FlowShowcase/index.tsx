import { View } from "@tarojs/components";
import { Flow } from "panelui-taro/flow";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

export const FlowShowcase = () => {
  const [event, setEvent] = useState(
    "Drag cards, pinch canvas, connect handles; long press for accessible actions"
  );
  return (
    <View className="flex flex-col gap-[24px]">
      <Flow
        className="h-[800px] flex-none"
        onNodeDragEnd={(id, position) =>
          setEvent(JSON.stringify({ id, position }))
        }
        onViewportChange={(viewport) => setEvent(JSON.stringify(viewport))}
        onConnect={(connection) => setEvent(JSON.stringify(connection))}
      >
        <Flow.Background />
        <Flow.Group
          id="study"
          label="Study plan"
          position={{ x: 12, y: 24 }}
          size={{ height: 290, width: 330 }}
        >
          <Flow.Node
            id="lesson"
            position={{ x: 32, y: 68 }}
            className="w-[220px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] p-[24px]"
          >
            <Text weight="medium">Read chapter</Text>
            <Flow.Handle id="out" type="source" />
          </Flow.Node>
          <Flow.Node
            id="practice"
            position={{ x: 200, y: 204 }}
            className="w-[220px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] p-[24px]"
            onPress={() => setEvent("Practice selected")}
          >
            <Text weight="medium">Practice</Text>
            <Flow.Handle id="in" type="target" position="left" />
          </Flow.Node>
        </Flow.Group>
        <Flow.Edge
          from={{ handle: "out", node: "lesson" }}
          to={{ handle: "in", node: "practice" }}
          animated
          arrow
        />
        <Flow.Controls />
        <Flow.MiniMap position="top-right" />
      </Flow>
      <Text size="xs">{event}</Text>
    </View>
  );
};
