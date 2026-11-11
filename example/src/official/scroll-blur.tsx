import { Badge } from "panelui-taro/badge";
import { BottomSheet } from "panelui-taro/bottom-sheet";
import { Button } from "panelui-taro/button";
import { PackageIcon } from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import { ScrollBlur } from "panelui-taro/scroll-blur";
import { Separator } from "panelui-taro/separator";
import { useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { ScrollView, View } from "../runtime/native";
import { useCSSVariable } from "../runtime/theme";
import { ComponentEntry } from "../types";
const FEEDS = [
  ["Ambient Kernel", "12.4k followers"],
  ["Slow Compile", "8.1k followers"],
  ["Null Pointer Club", "6.7k followers"],
  ["Static Types Weekly", "5.2k followers"],
  ["Render Pass", "4.9k followers"],
  ["Heap Fragments", "3.3k followers"],
  ["Tail Call", "2.8k followers"],
  ["Off By One", "2.1k followers"],
  ["Late Binding", "1.6k followers"],
  ["Dangling Ref", "980 followers"],
];
function ScrollBlurSheetVersion() {
  const [open, setOpen] = useState(true);
  const token = useCSSVariable("--color-popover");
  const surface = typeof token === "string" ? token : undefined;
  return (
    <View className="flex-1 items-center justify-center gap-4 p-6">
      <Text size="sm" muted className="text-center">
        The list scrolls under the button, and goes soft as it passes behind it.
      </Text>
      <Button variant="outline" onPress={() => setOpen(true)}>
        Open the sheet
      </Button>

      <BottomSheet open={open} onOpenChange={setOpen}>
        <BottomSheet.Content size="half" showClose={false} showGrabber={false}>
          <ScrollBlur
            edges="start"
            size={96}
            layers={7}
            color={surface}
            className="flex-1"
          >
            <BottomSheet.Body contentContainerClassName="gap-2 pb-4 pt-20">
              {FEEDS.map(([name, followers]) => (
                <Item key={name} variant="outline" size="sm">
                  <Item.Media variant="icon">
                    <PackageIcon size={16} />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{name}</Item.Title>
                    <Item.Description>{followers}</Item.Description>
                  </Item.Content>
                </Item>
              ))}
            </BottomSheet.Body>
          </ScrollBlur>

          <View
            pointerEvents="box-none"
            className="absolute inset-x-0 top-0 items-center pt-4"
          >
            <Button
              size="sm"
              className="rounded-full px-5"
              onPress={demoAction("Follow all")}
            >
              Follow all
            </Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "scroll-blur",
  name: "ScrollBlur",
  summary: "Blurs the edges of a scroll container",
  layout: "sections",
  demos: [
    {
      label: "A button over a list",
      id: "in-a-bottom-sheet",
      fullPage: true,
      description:
        "A blurred band under a floating button, over a list scrolling inside a bottom sheet.",
      render: () => <ScrollBlurSheetVersion />,
    },
    {
      label: "Vertical list",
      render: () => (
        <ScrollBlur size={64} className="h-72 w-full">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Item.Group>
              {FEEDS.map(([name, followers], index) => (
                <View key={name}>
                  {index > 0 ? <Item.Separator /> : null}
                  <Item size="sm">
                    <Item.Media variant="icon">
                      <PackageIcon size={14} />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>{name}</Item.Title>
                      <Item.Description>{followers}</Item.Description>
                    </Item.Content>
                  </Item>
                </View>
              ))}
            </Item.Group>
          </ScrollView>
        </ScrollBlur>
      ),
    },
    {
      label: "Horizontal cards",
      render: () => (
        <ScrollBlur size={48} className="w-full">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Item.Group orientation="horizontal">
              {[
                ["Overlays", "Dialog, sheet, toast"],
                ["Forms", "Input, select, switch"],
                ["Feedback", "Alert, progress, spinner"],
                ["Layout", "Card, frame, surface"],
                ["Motion", "Shimmer, scroll blur"],
                ["Theming", "Six themes, three families"],
              ].map(([title, description]) => (
                <Item
                  key={title}
                  orientation="vertical"
                  variant="outline"
                  size="sm"
                  className="w-44"
                >
                  <Item.Media variant="icon">
                    <PackageIcon size={16} />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{title}</Item.Title>
                    <Item.Description>{description}</Item.Description>
                  </Item.Content>
                </Item>
              ))}
            </Item.Group>
          </ScrollView>
        </ScrollBlur>
      ),
    },
    {
      label: "One edge",
      render: () => (
        <ScrollBlur size={56} edges="end" className="w-full">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Item.Group orientation="horizontal">
              {["One", "Two", "Three", "Four", "Five", "Six", "Seven"].map(
                (n) => (
                  <Item key={n} variant="muted" size="sm" className="w-32">
                    <Item.Content>
                      <Item.Title>{n}</Item.Title>
                    </Item.Content>
                  </Item>
                )
              )}
            </Item.Group>
          </ScrollView>
        </ScrollBlur>
      ),
    },
    {
      label: "Tuning the ramp",
      render: () => (
        <View className="w-full gap-4">
          <ScrollBlur size={40} layers={4} intensity={30} className="w-full">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {["Shallow", "Band", "Four", "Layers", "Low", "Intensity"].map(
                (n) => (
                  <Badge key={n} variant="secondary">
                    {n}
                  </Badge>
                )
              )}
            </ScrollView>
          </ScrollBlur>

          <ScrollBlur size={96} layers={6} intensity={60} className="w-full">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {["Deep", "Band", "Six", "Layers", "Full", "Intensity"].map(
                (n) => (
                  <Badge key={n}>{n}</Badge>
                )
              )}
            </ScrollView>
          </ScrollBlur>
        </View>
      ),
    },
  ],
};
