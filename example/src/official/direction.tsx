import { Badge } from "panelui-taro/badge";
import { Card } from "panelui-taro/card";
import {
  Direction,
  type DirectionValue,
  useDirection,
} from "panelui-taro/direction";
import {
  BellIcon,
  CardIcon,
  ChevronRightIcon,
  SendIcon,
  ShieldCheckIcon,
} from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Message } from "panelui-taro/message";
import { Text } from "panelui-taro/primitives/text";
import { Progress } from "panelui-taro/progress";
import { Separator } from "panelui-taro/separator";
import { Shimmer } from "panelui-taro/shimmer";
import { Slider } from "panelui-taro/slider";
import { Surface } from "panelui-taro/surface";
import { Switch } from "panelui-taro/switch";
import {
  ToggleButton,
  ToggleButtonGroup,
} from "panelui-taro/toggle-button";
import { useState } from "react";

import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
function DirectionRows() {
  return (
    <Item.Group>
      <Item>
        <Item.Media variant="icon">
          <BellIcon size={16} />
        </Item.Media>
        <Item.Content>
          <Item.Title>Notifications</Item.Title>
          <Item.Description>Badges, sounds, banners</Item.Description>
        </Item.Content>
        <Item.Actions>
          <ChevronRightIcon size={16} />
        </Item.Actions>
      </Item>
      <Item.Separator />
      <Item>
        <Item.Media variant="icon">
          <ShieldCheckIcon size={16} />
        </Item.Media>
        <Item.Content>
          <Item.Title>Privacy</Item.Title>
          <Item.Description>Two-factor is on</Item.Description>
        </Item.Content>
        <Item.Actions>
          <ChevronRightIcon size={16} />
        </Item.Actions>
      </Item>
      <Item.Separator />
      <Item>
        <Item.Media variant="icon">
          <CardIcon size={16} />
        </Item.Media>
        <Item.Content>
          <Item.Title>Payment</Item.Title>
          <Item.Description>Visa ending 4242</Item.Description>
        </Item.Content>
        <Item.Actions>
          <ChevronRightIcon size={16} />
        </Item.Actions>
      </Item>
      <Item.Separator />

      <Item>
        <Item.Media variant="icon">
          <SendIcon size={16} />
        </Item.Media>
        <Item.Content>
          <Item.Title>Send feedback</Item.Title>
          <Item.Description>Goes to the team</Item.Description>
        </Item.Content>
        <Item.Actions>
          <ChevronRightIcon size={16} />
        </Item.Actions>
      </Item>
    </Item.Group>
  );
}
function DirectionFlipDemo() {
  const [dir, setDir] = useState<string[]>(["rtl"]);
  const value = dir[0] === "rtl" ? "rtl" : "ltr";
  return (
    <View className="w-full gap-4">
      <ToggleButtonGroup
        selectionMode="single"
        value={dir}
        onValueChange={setDir}
      >
        <ToggleButton id="ltr">ltr</ToggleButton>
        <ToggleButton id="rtl">rtl</ToggleButton>
      </ToggleButtonGroup>

      <Direction dir={value} className="w-full">
        <DirectionRows />
      </Direction>
    </View>
  );
}
function DirectionReadout() {
  const dir = useDirection();
  return (
    <View className="flex-row items-center justify-between gap-3 px-4 py-3">
      <Text size="sm" muted>
        useDirection()
      </Text>
      <Badge variant="secondary">{dir}</Badge>
    </View>
  );
}
function DirectionNestedDemo() {
  return (
    <Direction dir="rtl" className="w-full gap-3">
      <Surface variant="secondary" className="w-full p-4">
        <Text weight="medium">حساب المستخدم</Text>
        <Text size="sm" muted>
          The card, its padding and its rows all mirror.
        </Text>
      </Surface>
      <Surface variant="secondary" className="w-full">
        <DirectionReadout />

        <Direction dir="ltr" className="border-border border-t">
          <View className="px-4 pt-3">
            <Text size="sm">+1 (555) 010-4477</Text>
          </View>
          <DirectionReadout />
        </Direction>
      </Surface>
    </Direction>
  );
}
function DirectionScreenVersion() {
  const [selection, setSelection] = useState<string[]>(["rtl"]);
  const dir: DirectionValue = selection[0] === "ltr" ? "ltr" : "rtl";
  const [volume, setVolume] = useState(65);
  const [sync, setSync] = useState(true);
  return (
    <View className="flex-1">
      <View className="items-center p-4">
        <ToggleButtonGroup
          selectionMode="single"
          value={selection}
          onValueChange={setSelection}
        >
          <ToggleButton id="ltr">ltr</ToggleButton>
          <ToggleButton id="rtl">rtl</ToggleButton>
        </ToggleButtonGroup>
      </View>

      <Direction dir={dir} className="flex-1">
        <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
          <View className="gap-1">
            <Text size="lg" weight="semibold">
              {dir === "rtl" ? "الإعدادات" : "Settings"}
            </Text>
            <Text size="sm" muted>
              {dir === "rtl"
                ? "تتبع المحاذاة اتجاه القراءة، وليس إعداد الجهاز."
                : "Alignment follows the reading direction, not the device setting."}
            </Text>
          </View>

          <Surface variant="secondary">
            <Item>
              <Item.Media>
                <BellIcon size={18} />
              </Item.Media>
              <Item.Content>
                <Item.Title>
                  {dir === "rtl" ? "الإشعارات" : "Notifications"}
                </Item.Title>
                <Item.Description>
                  {dir === "rtl"
                    ? "يتبع الشيفرون الاتجاه"
                    : "The chevron follows the direction"}
                </Item.Description>
              </Item.Content>
              <Item.Actions>
                <ChevronRightIcon size={16} />
              </Item.Actions>
            </Item>
            <Separator />
            <Item>
              <Item.Content>
                <Item.Title>{dir === "rtl" ? "المزامنة" : "Sync"}</Item.Title>
                <Item.Description>
                  {dir === "rtl"
                    ? "يتحرك المفتاح للجهة الصحيحة"
                    : "The thumb travels the right way"}
                </Item.Description>
              </Item.Content>
              <Item.Actions>
                <Switch value={sync} onValueChange={setSync} />
              </Item.Actions>
            </Item>
          </Surface>

          <Card>
            <Card.Header>
              <Card.Title>
                {dir === "rtl" ? "مستوى الصوت" : "Volume"}
              </Card.Title>
              <Card.Description>
                {dir === "rtl"
                  ? "اسحب: يتبع الإبهام إصبعك في كلا الاتجاهين."
                  : "Drag it — the thumb follows your finger in both directions."}
              </Card.Description>
            </Card.Header>
            <Card.Content className="gap-4">
              <Slider
                value={volume}
                onValueChange={setVolume}
                min={0}
                max={100}
              />
              <Progress value={volume} />
              <Shimmer>
                <Text size="sm" muted>
                  {dir === "rtl"
                    ? "يمسح مع النص"
                    : "The sweep runs with the script"}
                </Text>
              </Shimmer>
            </Card.Content>
          </Card>

          <Message align="start">
            <Message.Bubble>
              {dir === "rtl"
                ? "يشير الركن المربع إلى المرسل."
                : "The squared corner points back at its sender."}
            </Message.Bubble>
          </Message>
        </ScrollView>
      </Direction>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "direction",
  name: "Direction",
  summary: "Reading direction for everything below it",
  demos: [
    {
      label: "A whole screen, both ways",
      id: "screen",
      fullPage: true,
      description:
        "The parts Yoga cannot flip on its own — a drag, a thumb, a sweep, a glyph.",
      render: () => <DirectionScreenVersion />,
    },
    { label: "Flip it live", render: () => <DirectionFlipDemo /> },
    { label: "Nested, with an island", render: () => <DirectionNestedDemo /> },
    {
      label: "Right to left",
      render: () => (
        <Direction dir="rtl" className="w-full">
          <DirectionRows />
        </Direction>
      ),
    },
  ],
};
