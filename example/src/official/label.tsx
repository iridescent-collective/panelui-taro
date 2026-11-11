import { Input } from "panelui-taro/input";
import { Label } from "panelui-taro/label";
import { Text } from "panelui-taro/primitives/text";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "label",
  name: "Label",
  summary: "Form field label with required and invalid states",
  demos: [
    {
      label: "States",
      render: () => (
        <View className="w-full gap-5">
          <View className="gap-1.5">
            <Label>Username</Label>
            <Input placeholder="Choose a username" />
          </View>
          <View className="gap-1.5">
            <Label isRequired>Password</Label>
            <Input placeholder="Create a password" secureTextEntry />
          </View>
          <View className="gap-1.5">
            <Label isInvalid>Confirm password</Label>
            <Input value="different" errorMessage="Passwords do not match" />
          </View>
          <View className="gap-1.5">
            <Label isDisabled>Subscription plan</Label>
            <Input value="Premium" disabled />
          </View>
        </View>
      ),
    },
    {
      label: "Custom layout",
      render: () => (
        <View className="w-full gap-1.5">
          <Label isRequired>
            <Label.Text className="text-base font-semibold">API key</Label.Text>
          </Label>
          <Input placeholder="sk-…" />
        </View>
      ),
    },
  ],
};
