import { Card } from "panelui-taro/card";
import { Text } from "panelui-taro/primitives/text";
import { Spinner } from "panelui-taro/spinner";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "spinner",
  name: "Spinner",
  summary: "Indeterminate loading indicator",
  demos: [
    {
      label: "Sizes",
      render: () => (
        <View className="flex-row items-center gap-6">
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" />
        </View>
      ),
    },
    {
      label: "In another colour",
      render: () => (
        <View className="w-full flex-row items-center justify-center gap-4">
          <Spinner color="#E11D48" />

          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: "#2563EB" }}
          >
            <Spinner color="#FFFFFF" trackColor="rgba(255,255,255,0.25)" />
          </View>
          <View className="bg-muted rounded-xl p-4">
            <Spinner size="lg" color="#16A34A" />
          </View>
        </View>
      ),
    },
    {
      label: "In context",
      render: () => (
        <Card className="w-full">
          <Card.Content className="items-center gap-3 p-8">
            <Spinner size="lg" />
            <Text size="sm" muted>
              Loading your projects…
            </Text>
          </Card.Content>
        </Card>
      ),
    },
  ],
};
