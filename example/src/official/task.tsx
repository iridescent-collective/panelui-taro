import { FileIcon } from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Marker } from "panelui-taro/marker";
import { Task } from "panelui-taro/task";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function TaskRunDemo() {
  return (
    <View className="w-full gap-3">
      <Marker variant="separator">
        <Marker.Content>Ran 4 tools</Marker.Content>
      </Marker>
      <Task status="complete">
        <Task.Trigger title="Read 2 files" />
        <Task.Content>
          <Task.Item>
            Opened{" "}
            <Task.File icon={<FileIcon size={12} />}>
              calendar/index.tsx
            </Task.File>
          </Task.Item>
          <Task.Item>
            Opened{" "}
            <Task.File icon={<FileIcon size={12} />}>utils/date.ts</Task.File>
          </Task.Item>
        </Task.Content>
      </Task>
      <Task status="running">
        <Task.Trigger title="Editing the range band" />
        <Task.Content>
          <Task.Item>
            Rewriting the band computation in{" "}
            <Task.File>CalendarGrid</Task.File>
          </Task.Item>
        </Task.Content>
      </Task>
      <Task status="error">
        <Task.Trigger title="Typecheck failed" />
        <Task.Content>
          <Task.Item>openStart is declared but never read.</Task.Item>
        </Task.Content>
      </Task>
      <Task status="pending" defaultOpen={false}>
        <Task.Trigger title="Regenerate the docs" />
        <Task.Content>
          <Task.Item>Waiting on the typecheck.</Task.Item>
        </Task.Content>
      </Task>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "task",
  name: "Task",
  summary: "One step an agent took, and what it did there",
  demos: [
    { label: "A run of steps", render: () => <TaskRunDemo /> },
    {
      label: "One step",
      render: () => (
        <Task status="complete">
          <Task.Trigger title="Read 2 files" />
          <Task.Content>
            <Task.Item>
              Opened{" "}
              <Task.File icon={<FileIcon size={12} />}>theme.css</Task.File>
            </Task.Item>
            <Task.Item>Found 9 syntax tokens to add.</Task.Item>
          </Task.Content>
        </Task>
      ),
    },
  ],
};
