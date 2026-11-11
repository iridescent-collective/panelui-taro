import { Badge } from "panelui-taro/badge";
import { CheckIcon, PackageIcon } from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { ScrollFade } from "panelui-taro/scroll-fade";
import { Separator } from "panelui-taro/separator";

import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "scroll-fade",
  name: "ScrollFade",
  summary: "Fades the edges of a scroll container",
  layout: "sections",
  demos: [
    {
      label: "Horizontal cards",
      render: () => (
        <ScrollFade size={40} className="w-full">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Item.Group orientation="horizontal">
              {[
                ["Overlays", "Dialog, sheet, toast"],
                ["Forms", "Input, select, switch"],
                ["Feedback", "Alert, progress, spinner"],
                ["Layout", "Card, frame, surface"],
                ["Motion", "Shimmer, scroll fade"],
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
        </ScrollFade>
      ),
    },
    {
      label: "Vertical list",
      render: () => (
        <ScrollFade size={44} className="h-72 w-full">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Item.Group>
              {[
                ["Deployed to production", "2 minutes ago"],
                ["Migration applied", "18 minutes ago"],
                ["Build passed", "24 minutes ago"],
                ["Pull request merged", "1 hour ago"],
                ["Review requested", "2 hours ago"],
                ["Branch pushed", "3 hours ago"],
                ["Issue closed", "5 hours ago"],
                ["Release tagged", "Yesterday"],
              ].map(([title, when], index) => (
                <View key={title}>
                  {index > 0 ? <Item.Separator /> : null}
                  <Item size="sm">
                    <Item.Media variant="icon">
                      <CheckIcon size={14} />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title>{title}</Item.Title>
                      <Item.Description>{when}</Item.Description>
                    </Item.Content>
                  </Item>
                </View>
              ))}
            </Item.Group>
          </ScrollView>
        </ScrollFade>
      ),
    },
    {
      label: "One edge",
      render: () => (
        <ScrollFade size={56} edges="end" className="w-full">
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
        </ScrollFade>
      ),
    },
    {
      label: "Content that fits",
      render: () => (
        <ScrollFade size={40} className="w-full">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Item.Group orientation="horizontal">
              {["One", "Two"].map((n) => (
                <Item key={n} variant="outline" size="sm" className="w-32">
                  <Item.Content>
                    <Item.Title>{n}</Item.Title>
                  </Item.Content>
                </Item>
              ))}
            </Item.Group>
          </ScrollView>
        </ScrollFade>
      ),
    },
    {
      label: "Tuning the ramp",
      render: () => (
        <View className="w-full gap-4">
          <ScrollFade size={48} fadeInDistance={120} className="w-full">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {[
                "Slow",
                "Ramp",
                "Over",
                "A",
                "Long",
                "Distance",
                "Of",
                "Travel",
              ].map((n) => (
                <Badge key={n} variant="secondary">
                  {n}
                </Badge>
              ))}
            </ScrollView>
          </ScrollFade>

          <ScrollFade size={48} fadeInDistance={4} className="w-full">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {["Instant", "Ramp", "On", "The", "First", "Few", "Pixels"].map(
                (n) => (
                  <Badge key={n}>{n}</Badge>
                )
              )}
            </ScrollView>
          </ScrollFade>
        </View>
      ),
    },
  ],
};
