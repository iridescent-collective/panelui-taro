import { View, Text } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Dialog } from "panelui-taro/dialog";
import type { IconDefaults } from "panelui-taro/icons";
import { HeartIcon, icon, createIcon } from "panelui-taro/icons";
import { Input } from "panelui-taro/input";
import type { TextInputRef } from "panelui-taro/primitives/refs";
import { Switch } from "panelui-taro/switch";
import { useTheme } from "panelui-taro/theme";
import { useRef, useState } from "react";

const defaults: IconDefaults = { color: "#737373", flip: true, size: 18 };
const PackedArrowIcon = icon(
  [["path", { d: "M4 12h16m-6-6 6 6-6 6" }]],
  defaults
);
const PackedAlternateIcon = createIcon(
  [["circle", { cx: 12, cy: 12, r: 8 }]],
  defaults
);

export const ConsumerCheck = () => {
  const input = useRef<TextInputRef>(null);
  const [count, setCount] = useState(0);
  const [checked, setChecked] = useState(false);
  const { theme, setTheme } = useTheme();
  return (
    <View className="flex flex-col gap-6 p-6">
      <Card>
        <Card.Header>
          <Card.Title>Installed from tarball</Card.Title>
          <Card.Description>No workspace links or patches</Card.Description>
        </Card.Header>
        <Card.Content>
          <View className="flex flex-col gap-4">
            <Text>Clicks: {count}</Text>
            <PackedArrowIcon />
            <PackedAlternateIcon />
            <Input ref={input} label="Packed input" />
            <Button onPress={() => input.current?.focus()}>Focus input</Button>
            <Button
              onPress={() => setCount((value) => value + 1)}
              startContent={<HeartIcon size={18} />}
            >
              Increment
            </Button>
            <Button
              variant="outline"
              onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              Theme: {theme}
            </Button>
            <Switch
              value={checked}
              onValueChange={setChecked}
              accessibilityLabel="Packed switch"
            />
            <Text>Switch: {checked ? "on" : "off"}</Text>
            <Dialog>
              <Dialog.Trigger>
                <Button variant="secondary">Open dialog</Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <Dialog.Title>Packed overlay works</Dialog.Title>
                <Dialog.Description>
                  Rendered through the installed provider.
                </Dialog.Description>
                <Dialog.Close>
                  <Button>Close dialog</Button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};
