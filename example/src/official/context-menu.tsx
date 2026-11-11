import Flag01Icon from "@hugeicons/core-free-icons/Flag01Icon";
import TextSelectIcon from "@hugeicons/core-free-icons/TextSelectIcon";
import { Card } from "panelui-taro/card";
import { ContextMenu } from "panelui-taro/context-menu";
import {
  BookmarkIcon,
  CopyIcon,
  LinkIcon,
  PencilIcon,
  ShareNodesIcon,
  SparklesIcon,
  TrashIcon,
} from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Label } from "panelui-taro/label";
import { Text } from "panelui-taro/primitives/text";
import { Separator } from "panelui-taro/separator";
import { useState } from "react";

import { HugeiconsIcon } from "../runtime/icons";
import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function ContextMenuMessageDemo() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <View className="w-full gap-3 py-2">
      <ContextMenu>
        <ContextMenu.Trigger haptics>
          <Card>
            <Card.Content className="p-4">
              <Text>
                Would you like an interactive web-based todo application, or a
                command-line one?
              </Text>
            </Card.Content>
          </Card>
        </ContextMenu.Trigger>

        <ContextMenu.Content>
          <ContextMenu.Item
            icon={<SparklesIcon size={18} />}
            onSelect={() => setLast("Ask AI")}
          >
            Ask AI
          </ContextMenu.Item>
          <ContextMenu.Item
            icon={<ShareNodesIcon size={18} />}
            onSelect={() => setLast("Share")}
          >
            Share
          </ContextMenu.Item>
          <ContextMenu.Item
            icon={<CopyIcon size={18} />}
            onSelect={() => setLast("Copy")}
          >
            Copy
          </ContextMenu.Item>
          <ContextMenu.Item
            icon={<HugeiconsIcon icon={TextSelectIcon} size={18} />}
            onSelect={() => setLast("Select text")}
          >
            Select text
          </ContextMenu.Item>

          <ContextMenu.Separator />

          <ContextMenu.Item
            variant="destructive"
            icon={<HugeiconsIcon icon={Flag01Icon} size={18} />}
            onSelect={() => setLast("Report")}
          >
            Report
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>

      <Text size="xs" muted>
        {last ? `Chose: ${last}` : "Press and hold the card."}
      </Text>
    </View>
  );
}
function ContextMenuPreviewDemo() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <View className="w-full gap-3 py-2">
      <ContextMenu>
        <ContextMenu.Trigger haptics>
          <Card>
            <Card.Content className="gap-1 p-4">
              <Text className="font-semibold">Coastal path, Tuesday</Text>
              <Text size="sm" muted>
                14.2 km · 3h 40m · 260 m climbed
              </Text>
            </Card.Content>
          </Card>
        </ContextMenu.Trigger>

        <ContextMenu.Content>
          <ContextMenu.Preview />

          <ContextMenu.Item
            icon={<BookmarkIcon size={18} />}
            onSelect={() => setLast("Save")}
          >
            Save
          </ContextMenu.Item>
          <ContextMenu.Item
            icon={<LinkIcon size={18} />}
            onSelect={() => setLast("Copy link")}
          >
            Copy link
          </ContextMenu.Item>
          <ContextMenu.Item
            icon={<ShareNodesIcon size={18} />}
            onSelect={() => setLast("Share")}
          >
            Share
          </ContextMenu.Item>

          <ContextMenu.Separator />

          <ContextMenu.Item
            variant="destructive"
            icon={<TrashIcon size={18} />}
            onSelect={() => setLast("Delete")}
          >
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>

      <Text size="xs" muted>
        {last
          ? `Chose: ${last}`
          : "Hold the card — it comes forward with the menu."}
      </Text>
    </View>
  );
}
function ContextMenuRowDemo() {
  const [status, setStatus] = useState("Tap to open, hold for actions.");
  const [pinned, setPinned] = useState(false);
  return (
    <View className="w-full gap-3 py-2">
      <ContextMenu>
        <ContextMenu.Trigger
          anchor="target"
          haptics
          onPress={() => setStatus("Tapped — opened the note.")}
        >
          <Item variant="outline">
            <Item.Content>
              <Item.Title>Design review</Item.Title>
              <Item.Description>Edited 20 minutes ago</Item.Description>
            </Item.Content>
          </Item>
        </ContextMenu.Trigger>

        <ContextMenu.Content align="end">
          <ContextMenu.Item
            icon={<PencilIcon size={18} />}
            onSelect={() => setStatus("Held — chose Rename.")}
          >
            Rename
          </ContextMenu.Item>

          <ContextMenu.CheckboxItem
            checked={pinned}
            onCheckedChange={setPinned}
          >
            Pinned
          </ContextMenu.CheckboxItem>
          <ContextMenu.Separator />
          <ContextMenu.Item
            variant="destructive"
            icon={<TrashIcon size={18} />}
            onSelect={() => setStatus("Held — chose Delete.")}
          >
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>

      <Text size="xs" muted>
        {status}
        {pinned ? " · pinned" : ""}
      </Text>
    </View>
  );
}
function ContextMenuPlacementDemo() {
  const places: {
    label: string;
    placement: "top" | "bottom";
    align: "start" | "center" | "end";
    anchor?: "point" | "target";
  }[] = [
    { label: "Down from the press", placement: "bottom", align: "start" },
    { label: "Down, centred", placement: "bottom", align: "center" },
    { label: "Up from the press", placement: "top", align: "start" },
    {
      label: "Lined up with the row",
      placement: "bottom",
      align: "end",
      anchor: "target",
    },
  ];
  return (
    <View className="w-full gap-2 py-2">
      {places.map((place) => (
        <ContextMenu key={place.label}>
          <ContextMenu.Trigger haptics anchor={place.anchor ?? "point"}>
            <Item variant="outline">
              <Item.Content>
                <Item.Title>{place.label}</Item.Title>
                <Item.Description>
                  placement=&quot;{place.placement}&quot; · align=&quot;
                  {place.align}&quot;
                </Item.Description>
              </Item.Content>
            </Item>
          </ContextMenu.Trigger>

          <ContextMenu.Content placement={place.placement} align={place.align}>
            <ContextMenu.Item icon={<ShareNodesIcon size={18} />}>
              Share
            </ContextMenu.Item>
            <ContextMenu.Item icon={<CopyIcon size={18} />}>
              Copy
            </ContextMenu.Item>
            <ContextMenu.Item icon={<BookmarkIcon size={18} />}>
              Save
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu>
      ))}
    </View>
  );
}
function ContextMenuSheetDemo() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <View className="w-full gap-3 py-2">
      <ContextMenu presentation="bottom-sheet">
        <ContextMenu.Trigger haptics>
          <Item variant="outline">
            <Item.Content>
              <Item.Title>Quarterly report.pdf</Item.Title>
              <Item.Description>2.4 MB · shared with 6 people</Item.Description>
            </Item.Content>
          </Item>
        </ContextMenu.Trigger>

        <ContextMenu.Content>
          <ContextMenu.Label>Quarterly report.pdf</ContextMenu.Label>
          <ContextMenu.Item
            icon={<ShareNodesIcon size={18} />}
            onSelect={() => setLast("Share")}
          >
            Share
          </ContextMenu.Item>
          <ContextMenu.Item
            icon={<LinkIcon size={18} />}
            onSelect={() => setLast("Copy link")}
          >
            Copy link
          </ContextMenu.Item>
          <ContextMenu.Item
            icon={<BookmarkIcon size={18} />}
            onSelect={() => setLast("Save for later")}
          >
            Save for later
          </ContextMenu.Item>
          <ContextMenu.Item
            icon={<PencilIcon size={18} />}
            onSelect={() => setLast("Rename")}
          >
            Rename
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item
            variant="destructive"
            icon={<TrashIcon size={18} />}
            onSelect={() => setLast("Delete")}
          >
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>

      <Text size="xs" muted>
        {last ? `Chose: ${last}` : "Press and hold the row."}
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "context-menu",
  name: "ContextMenu",
  summary: "Actions for a piece of content, opened by holding it",
  demos: [
    { label: "Holding a message", render: () => <ContextMenuMessageDemo /> },
    {
      label: "The held card, lifted",
      render: () => <ContextMenuPreviewDemo />,
    },
    {
      label: "A tap and a hold on one row",
      render: () => <ContextMenuRowDemo />,
    },
    {
      label: "Where the panel goes",
      render: () => <ContextMenuPlacementDemo />,
    },
    { label: "As a bottom sheet", render: () => <ContextMenuSheetDemo /> },
  ],
};
