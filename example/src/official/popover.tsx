import { Button } from "panelui-taro/button";
import { InfoIcon } from "panelui-taro/icons";
import { Input } from "panelui-taro/input";
import { Popover } from "panelui-taro/popover";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { Pressable, View } from "../runtime/native";
import { ComponentEntry } from "../types";
function PlacementPopover({
  placement,
}: {
  placement: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Popover>
      <Popover.Trigger>
        <Button variant="secondary" size="sm">
          {placement}
        </Button>
      </Popover.Trigger>
      <Popover.Content placement={placement} className="w-40">
        <Popover.Arrow />
        <Popover.Description>
          Opens {placement} of the trigger.
        </Popover.Description>
      </Popover.Content>
    </Popover>
  );
}
function PopoverFormDemo() {
  const [name, setName] = useState("Untitled board");
  const [open, setOpen] = useState(false);
  return (
    <View className="w-full py-4">
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger>
          <Button variant="outline" fullWidth>
            Rename board
          </Button>
        </Popover.Trigger>

        <Popover.Content
          width="trigger"
          minWidth={260}
          align="start"
          className="gap-3"
        >
          <Popover.Title>Rename</Popover.Title>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Board name"
            accessibilityLabel="Board name"
          />
          <View className="flex-row justify-end gap-2">
            <Popover.Close>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </Popover.Close>
            <Popover.Close>
              <Button size="sm">Save</Button>
            </Popover.Close>
          </View>
        </Popover.Content>
      </Popover>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "popover",
  name: "Popover",
  summary: "Panel anchored to the thing that opened it",
  layout: "sections",
  demos: [
    {
      label: "A long panel, scrolled",
      render: () => (
        <View className="w-full items-center py-4">
          <Popover>
            <Popover.Trigger>
              <Button variant="outline">Release notes</Button>
            </Popover.Trigger>

            <Popover.Content
              scrollable
              maxHeight={260}
              align="start"
              className="w-72"
            >
              <Popover.Title>What changed</Popover.Title>
              {Array.from({ length: 8 }, (_, index) => (
                <Popover.Description key={index}>
                  {`Release note ${index + 1} — a line of detail long enough to
                      take a couple of rows on a phone.`}
                </Popover.Description>
              ))}
            </Popover.Content>
          </Popover>
        </View>
      ),
    },
    {
      label: "Placement",
      render: () => (
        <View className="h-72 w-full justify-between py-4">
          <View className="flex-row justify-center">
            <PlacementPopover placement="bottom" />
          </View>
          <View className="flex-row items-center justify-between">
            <PlacementPopover placement="right" />
            <PlacementPopover placement="left" />
          </View>
          <View className="flex-row justify-center">
            <PlacementPopover placement="top" />
          </View>
        </View>
      ),
    },
    {
      label: "With an arrow",
      render: () => (
        <View className="w-full items-center py-4">
          <Popover>
            <Popover.Trigger>
              <Button
                variant="ghost"
                size="icon"
                accessibilityLabel="What is this?"
              >
                <InfoIcon size={18} />
              </Button>
            </Popover.Trigger>

            <Popover.Content className="w-60">
              <Popover.Arrow />
              <Popover.Title>Monthly active users</Popover.Title>
              <Popover.Description>
                Anyone who opened the app at least once in the last 30 days.
              </Popover.Description>
            </Popover.Content>
          </Popover>
        </View>
      ),
    },
    {
      label: "A form, matching the trigger width",
      render: () => <PopoverFormDemo />,
    },
    {
      label: "Blurred background",
      render: () => (
        <View className="w-full items-center py-4">
          <Popover>
            <Popover.Trigger>
              <Button variant="outline">Frost the screen</Button>
            </Popover.Trigger>

            <Popover.Content blur align="start" className="w-64">
              <Popover.Arrow />
              <Popover.Title>Focus here</Popover.Title>
              <Popover.Description>
                The list behind is blurred so this panel reads as the only thing
                to deal with.
              </Popover.Description>
            </Popover.Content>
          </Popover>
        </View>
      ),
    },
    {
      label: "As a bottom sheet",
      render: () => (
        <View className="w-full items-center py-4">
          <Popover presentation="bottom-sheet">
            <Popover.Trigger>
              <Button variant="outline">Open as a sheet</Button>
            </Popover.Trigger>
            <Popover.Content>
              <Popover.Title>Sort by</Popover.Title>
              <Popover.Description className="mb-2">
                The same content, presented from the bottom.
              </Popover.Description>
              {["Newest", "Oldest", "Most active"].map((option) => (
                <Popover.Close key={option}>
                  <Pressable
                    accessibilityRole="menuitem"
                    onPress={demoAction("Pressable selected")}
                    className="active:bg-accent rounded-xl px-3 py-3"
                  >
                    <Text>{option}</Text>
                  </Pressable>
                </Popover.Close>
              ))}
            </Popover.Content>
          </Popover>
        </View>
      ),
    },
  ],
};
