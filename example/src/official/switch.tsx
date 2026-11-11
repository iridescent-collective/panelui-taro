import { Alert } from "panelui-taro/alert";
import { Card } from "panelui-taro/card";
import { Text } from "panelui-taro/primitives/text";
import { Separator } from "panelui-taro/separator";
import { Switch, type SwitchProps } from "panelui-taro/switch";
import { useState, type ReactNode } from "react";

import { View } from "../runtime/native";
import { hasNativeUI } from "../runtime/native";
import { ComponentEntry } from "../types";
function StatefulSwitch({
  value: initial,
  ...props
}: Omit<SwitchProps, "onValueChange">) {
  const [value, setValue] = useState(initial);
  return <Switch {...props} value={value} onValueChange={setValue} />;
}
function SwitchDemo() {
  const [enabled, setEnabled] = useState(true);
  const [push, setPush] = useState(false);
  return (
    <Card className="w-full">
      <Card.Content className="gap-5 p-4">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text weight="medium">Email notifications</Text>
            <Text size="sm" muted>
              Receive updates and newsletters
            </Text>
          </View>
          <Switch value={enabled} onValueChange={setEnabled} />
        </View>
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text weight="medium">Push notifications</Text>
            <Text size="sm" muted>
              Get instant alerts on your device
            </Text>
          </View>
          <Switch value={push} onValueChange={setPush} />
        </View>
      </Card.Content>
    </Card>
  );
}
function HapticSwitchDemo() {
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  return (
    <Card className="w-full">
      <Card.Content className="gap-5 p-4">
        <Text size="sm" muted>
          Each flip fires a light tick — install expo-haptics to feel it on a
          device.
        </Text>
        <View className="flex-row items-center justify-between gap-4">
          <Text weight="medium">Wi-Fi</Text>
          <Switch haptics value={wifi} onValueChange={setWifi} />
        </View>
        <View className="flex-row items-center justify-between gap-4">
          <Text weight="medium">Bluetooth</Text>
          <Switch haptics value={bluetooth} onValueChange={setBluetooth} />
        </View>
      </Card.Content>
    </Card>
  );
}
function NativeDemo({ children }: { children: ReactNode }) {
  return (
    <View className="w-full gap-5">
      <Alert variant={hasNativeUI() ? "info" : "warning"}>
        <Alert.Content>
          <Alert.Title>
            {hasNativeUI()
              ? "Rendering the platform control"
              : "@expo/ui not available"}
          </Alert.Title>
          <Alert.Description>
            {hasNativeUI()
              ? "Theme tokens do not apply here — the platform draws this."
              : "The `native` prop is a no-op, so the styled component renders instead."}
          </Alert.Description>
        </Alert.Content>
      </Alert>

      <Separator />
      <View className="w-full gap-4">{children}</View>
    </View>
  );
}
function NativeSwitchDemo() {
  const [enabled, setEnabled] = useState(true);
  return (
    <NativeDemo>
      <Switch
        native
        label="Notifications"
        value={enabled}
        onValueChange={setEnabled}
      />
    </NativeDemo>
  );
}
export const entry: ComponentEntry = {
  slug: "switch",
  name: "Switch",
  summary: "On/off toggle",
  demos: [
    { label: "Settings rows", render: () => <SwitchDemo /> },
    {
      label: "States",
      render: () => (
        <View className="gap-5">
          <View className="flex-row items-center gap-3">
            <StatefulSwitch value />
            <Text size="sm" muted>
              On
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <StatefulSwitch value={false} />
            <Text size="sm" muted>
              Off
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <StatefulSwitch value disabled />
            <Text size="sm" muted>
              Disabled
            </Text>
          </View>
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="gap-5">
          {(
            [
              ["xs", "Extra small"],
              ["sm", "Small"],
              ["md", "Medium"],
              ["lg", "Large"],
              ["xl", "Extra large"],
            ] as const
          ).map(([size, name]) => (
            <View key={size} className="flex-row items-center gap-3">
              <StatefulSwitch size={size} value label={name} />
              <Text size="sm" muted>
                {name}
              </Text>
            </View>
          ))}
        </View>
      ),
    },
    { label: "Haptics", render: () => <HapticSwitchDemo /> },
    { label: "Native", render: () => <NativeSwitchDemo /> },
  ],
};
