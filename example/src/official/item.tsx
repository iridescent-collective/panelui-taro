import { Avatar } from "panelui-taro/avatar";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import {
  BellIcon,
  ChevronRightIcon,
  PackageIcon,
  ReceiptIcon,
} from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import { Separator } from "panelui-taro/separator";

import { demoAction } from "../runtime/demo-action";
import { Image, ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const PHOTO =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=60";
const AVATARS = [
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=32",
  "https://i.pravatar.cc/150?img=47",
];
const price = (value: number) => `$${value.toFixed(2)}`;
export const entry: ComponentEntry = {
  slug: "item",
  name: "Item",
  summary: "Row of media, text and actions",
  demos: [
    {
      label: "Variants",
      render: () => (
        <View className="w-full gap-3">
          {(["default", "outline", "muted"] as const).map((variant) => (
            <Item key={variant} variant={variant}>
              <Item.Media variant="icon">
                <PackageIcon size={18} />
              </Item.Media>
              <Item.Content>
                <Item.Title>{variant}</Item.Title>
                <Item.Description>
                  The {variant} surface treatment.
                </Item.Description>
              </Item.Content>
              <Item.Actions>
                <Badge variant="secondary">New</Badge>
              </Item.Actions>
            </Item>
          ))}
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-3">
          {(["default", "sm", "xs"] as const).map((size) => (
            <Item key={size} variant="outline" size={size}>
              <Item.Media variant="icon">
                <ReceiptIcon size={size === "xs" ? 12 : 16} />
              </Item.Media>
              <Item.Content>
                <Item.Title>Size {size}</Item.Title>
                <Item.Description>
                  Media, title and description all follow it.
                </Item.Description>
              </Item.Content>
            </Item>
          ))}
        </View>
      ),
    },
    {
      label: "Media types",
      render: () => (
        <View className="w-full gap-3">
          <Item variant="outline">
            <Item.Media variant="icon">
              <BellIcon size={18} />
            </Item.Media>
            <Item.Content>
              <Item.Title>Icon tile</Item.Title>
              <Item.Description>variant=&quot;icon&quot;</Item.Description>
            </Item.Content>
          </Item>

          <Item variant="outline">
            <Item.Media variant="image">
              <Image source={{ uri: PHOTO }} className="h-full w-full" />
            </Item.Media>
            <Item.Content>
              <Item.Title>Thumbnail</Item.Title>
              <Item.Description>variant=&quot;image&quot;</Item.Description>
            </Item.Content>
          </Item>

          <Item variant="outline">
            <Item.Media>
              <Avatar size="md" source={{ uri: AVATARS[0] }} fallback="KA" />
            </Item.Media>
            <Item.Content>
              <Item.Title>Avatar passed through</Item.Title>
              <Item.Description>
                The default media variant adds no box.
              </Item.Description>
            </Item.Content>
          </Item>
        </View>
      ),
    },
    {
      label: "A settings group",
      render: () => (
        <Card className="w-full overflow-hidden">
          <Item.Group>
            {[
              ["Notifications", "Push, email and in-app"],
              ["Privacy", "Who can see your activity"],
              ["Appearance", "Theme and text size"],
            ].map(([title, description], index) => (
              <View key={title}>
                {index > 0 ? <Item.Separator /> : null}
                <Item size="sm" onPress={demoAction("Item selected")}>
                  <Item.Content>
                    <Item.Title>{title}</Item.Title>
                    <Item.Description>{description}</Item.Description>
                  </Item.Content>
                  <Item.Actions>
                    <ChevronRightIcon size={16} />
                  </Item.Actions>
                </Item>
              </View>
            ))}
          </Item.Group>
        </Card>
      ),
    },
    {
      label: "Horizontal group of cards",
      render: () => (
        <View className="w-full gap-4">
          <Text size="sm" muted>
            Two independent axes. `orientation` on the group runs the items
            across instead of down; `orientation` on each item stacks its own
            parts into a card. A carousel wants both.
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Item.Group orientation="horizontal">
              {[
                ["Starter", "$0", "One project"],
                ["Pro", "$12", "Unlimited projects"],
                ["Team", "$40", "Shared workspaces"],
              ].map(([name, price, summary]) => (
                <Item
                  key={name}
                  orientation="vertical"
                  variant="outline"
                  className="w-48"
                >
                  <Item.Media variant="icon">
                    <PackageIcon size={18} />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{name}</Item.Title>
                    <Item.Description>{summary}</Item.Description>
                  </Item.Content>
                  <Item.Footer>
                    <Text weight="semibold">{price}</Text>
                    <Text size="xs" muted>
                      per month
                    </Text>
                  </Item.Footer>
                </Item>
              ))}
            </Item.Group>
          </ScrollView>
        </View>
      ),
    },
    {
      label: "A vertical item",
      render: () => (
        <Item orientation="vertical" variant="outline">
          <Item.Header>
            <Badge variant="secondary">Draft</Badge>
            <Text size="xs" muted>
              Updated 2h ago
            </Text>
          </Item.Header>
          <Item.Content>
            <Item.Title>Quarterly report</Item.Title>
            <Item.Description>
              Revenue, retention and headcount for Q3.
            </Item.Description>
          </Item.Content>
          <Item.Footer>
            <Button size="sm" variant="outline" onPress={demoAction("Preview")}>
              Preview
            </Button>
            <Button size="sm" onPress={demoAction("Publish")}>
              Publish
            </Button>
          </Item.Footer>
        </Item>
      ),
    },
  ],
};
