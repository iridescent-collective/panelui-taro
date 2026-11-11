import { Badge } from "panelui-taro/badge";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import {
  Sortable,
  reorderItems,
  useSortableItem,
} from "panelui-taro/sortable";
import { useState } from "react";

import Animated, { useAnimatedRef } from "../runtime/motion";
import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
function SortableTasksDemo() {
  const [tasks, setTasks] = useState([
    { id: "notes", title: "Draft the release notes" },
    { id: "tag", title: "Cut the tag" },
    { id: "publish", title: "Publish to npm" },
    { id: "post", title: "Post the changelog" },
  ]);
  return (
    <Sortable
      value={tasks.map((task) => task.id)}
      onReorder={(_, { from, to }) =>
        setTasks((t) => reorderItems(t, from, to))
      }
      gap={8}
      className="w-full"
    >
      {tasks.map((task, index) => (
        <Sortable.Item key={task.id} id={task.id}>
          <Item variant="outline">
            <Item.Media variant="icon">
              <Text size="sm" muted>
                {index + 1}
              </Text>
            </Item.Media>
            <Item.Content>
              <Item.Title>{task.title}</Item.Title>
            </Item.Content>
            <Sortable.Handle />
          </Item>
        </Sortable.Item>
      ))}
    </Sortable>
  );
}
function SortableLongPressDemo() {
  const [colors, setColors] = useState([
    { id: "iris", name: "Iris", hex: "#6366f1" },
    { id: "moss", name: "Moss", hex: "#16a34a" },
    { id: "ember", name: "Ember", hex: "#ea580c" },
    { id: "slate", name: "Slate", hex: "#475569" },
  ]);
  return (
    <View className="w-full gap-3">
      <Text size="sm" muted>
        Hold a row for a moment, then drag it.
      </Text>
      <Sortable
        value={colors.map((color) => color.id)}
        onReorder={(_, { from, to }) =>
          setColors((c) => reorderItems(c, from, to))
        }
        activation="longPress"
        gap={8}
        className="w-full"
      >
        {colors.map((color) => (
          <Sortable.Item key={color.id} id={color.id}>
            <Item variant="outline">
              <View
                className="h-9 w-9 rounded-lg"
                style={{ backgroundColor: color.hex }}
              />
              <Item.Content>
                <Item.Title>{color.name}</Item.Title>
                <Item.Description>{color.hex}</Item.Description>
              </Item.Content>
            </Item>
          </Sortable.Item>
        ))}
      </Sortable>
    </View>
  );
}
function SortableMixedHeightsDemo() {
  const [notes, setNotes] = useState([
    { id: "n1", title: "Ship the registry fix", body: null as string | null },
    {
      id: "n2",
      title: "Rewrite the theming page",
      body: "The token table is out of date in three places, and the dark-mode section still describes the old variable names.",
    },
    { id: "n3", title: "Answer the issue about Metro", body: null },
    {
      id: "n4",
      title: "Record the previews",
      body: "Four components changed this week.",
    },
  ]);
  return (
    <Sortable
      value={notes.map((note) => note.id)}
      onReorder={(_, { from, to }) =>
        setNotes((n) => reorderItems(n, from, to))
      }
      gap={8}
      className="w-full"
    >
      {notes.map((note) => (
        <Sortable.Item key={note.id} id={note.id}>
          <Item variant="outline">
            <Item.Content>
              <Item.Title>{note.title}</Item.Title>
              {note.body ? (
                <Item.Description>{note.body}</Item.Description>
              ) : null}
            </Item.Content>
            <Sortable.Handle />
          </Item>
        </Sortable.Item>
      ))}
    </Sortable>
  );
}
function SortableActiveRow({ label }: { label: string }) {
  const { index, isActive } = useSortableItem();
  return (
    <Item
      variant="outline"
      className={isActive ? "border-primary bg-muted" : undefined}
    >
      <Item.Content>
        <Item.Title>{label}</Item.Title>
        <Item.Description>Position {index + 1}</Item.Description>
      </Item.Content>
      {isActive ? <Badge variant="secondary">Moving</Badge> : null}
      <Sortable.Handle />
    </Item>
  );
}
function SortableActiveDemo() {
  const [rows, setRows] = useState([
    { id: "r1", label: "Overview" },
    { id: "r2", label: "Usage" },
    { id: "r3", label: "Examples" },
    { id: "r4", label: "Props" },
  ]);
  return (
    <Sortable
      value={rows.map((row) => row.id)}
      onReorder={(_, { from, to }) => setRows((r) => reorderItems(r, from, to))}
      gap={8}
      className="w-full"
    >
      {rows.map((row) => (
        <Sortable.Item key={row.id} id={row.id}>
          <SortableActiveRow label={row.label} />
        </Sortable.Item>
      ))}
    </Sortable>
  );
}
function SortablePinnedDemo() {
  const [steps, setSteps] = useState([
    { id: "s1", title: "Install the package", fixed: true },
    { id: "s2", title: "Add the provider" },
    { id: "s3", title: "Import the theme" },
    { id: "s4", title: "Render a Button" },
  ]);
  return (
    <Sortable
      value={steps.map((step) => step.id)}
      onReorder={(_, { from, to }) =>
        setSteps((s) => reorderItems(s, from, to))
      }
      gap={8}
      className="w-full"
    >
      {steps.map((step) => (
        <Sortable.Item key={step.id} id={step.id} pinned={step.fixed}>
          <Item variant="outline">
            <Item.Content>
              <Item.Title>{step.title}</Item.Title>
            </Item.Content>
            {step.fixed ? (
              <Badge variant="outline">Fixed</Badge>
            ) : (
              <Sortable.Handle />
            )}
          </Item>
        </Sortable.Item>
      ))}
    </Sortable>
  );
}
function SortableDisabledDemo() {
  const [fields, setFields] = useState([
    { id: "f1", title: "Email address", locked: true },
    { id: "f2", title: "Display name" },
    { id: "f3", title: "Company" },
    { id: "f4", title: "Phone number" },
  ]);
  return (
    <Sortable
      value={fields.map((field) => field.id)}
      onReorder={(_, { from, to }) =>
        setFields((f) => reorderItems(f, from, to))
      }
      gap={8}
      className="w-full"
    >
      {fields.map((field) => (
        <Sortable.Item key={field.id} id={field.id} disabled={field.locked}>
          <Item variant="outline">
            <Item.Content>
              <Item.Title>{field.title}</Item.Title>
            </Item.Content>
            {field.locked ? <Badge variant="secondary">Locked</Badge> : null}
            <Sortable.Handle />
          </Item>
        </Sortable.Item>
      ))}
    </Sortable>
  );
}
const SORTABLE_TRACKS = [
  "Opening titles",
  "The long walk",
  "Nightfall",
  "Something borrowed",
  "A room upstairs",
  "Weather over the bay",
  "Two trains",
  "The argument",
  "Reprise",
  "Last light",
  "Winter, briefly",
  "The letter",
  "Coastline",
  "Everything after",
  "Closing titles",
];
function SortableScrollDemo() {
  const scroller = useAnimatedRef<import("../runtime/native").NativeScrollHandle>();
  const [tracks, setTracks] = useState(
    SORTABLE_TRACKS.map((title, index) => ({ id: `t${index}`, title }))
  );
  return (
    <Animated.ScrollView
      ref={scroller}
      contentContainerClassName="px-5 pb-10"
      showsVerticalScrollIndicator={false}
    >
      <Sortable
        value={tracks.map((track) => track.id)}
        onReorder={(_, { from, to }) =>
          setTracks((t) => reorderItems(t, from, to))
        }
        scrollRef={scroller}
        gap={8}
        className="w-full"
      >
        {tracks.map((track, index) => (
          <Sortable.Item key={track.id} id={track.id}>
            <Item variant="outline">
              <Item.Media variant="icon">
                <Text size="sm" muted>
                  {index + 1}
                </Text>
              </Item.Media>
              <Item.Content>
                <Item.Title>{track.title}</Item.Title>
              </Item.Content>
              <Sortable.Handle />
            </Item>
          </Sortable.Item>
        ))}
      </Sortable>
    </Animated.ScrollView>
  );
}
export const entry: ComponentEntry = {
  slug: "sortable",
  name: "Sortable",
  summary: "A list whose rows can be dragged into a different order",
  demos: [
    { label: "A list you can reorder", render: () => <SortableTasksDemo /> },
    {
      label: "Lifting on a long press",
      render: () => <SortableLongPressDemo />,
    },
    {
      label: "Rows of different heights",
      render: () => <SortableMixedHeightsDemo />,
    },
    {
      label: "A row that knows it is being carried",
      render: () => <SortableActiveDemo />,
    },
    { label: "A row that stays put", render: () => <SortablePinnedDemo /> },
    {
      label: "A row that cannot be picked up",
      render: () => <SortableDisabledDemo />,
    },
    {
      label: "A list longer than the screen",
      id: "autoscroll",
      description:
        "Carry a row to the top or bottom edge and the list scrolls under it.",
      fullPage: true,
      render: () => <SortableScrollDemo />,
    },
  ],
};
