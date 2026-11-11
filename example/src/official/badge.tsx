import { Badge } from "panelui-taro/badge";
import { Text } from "panelui-taro/primitives/text";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "badge",
  name: "Badge",
  summary: "Compact status label",
  demos: [
    {
      label: "Variants",
      render: () => (
        <View className="flex-row flex-wrap items-center justify-center gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Error</Badge>
          <Badge variant="info">Info</Badge>
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="items-center gap-4">
          <View className="flex-row flex-wrap items-center justify-center gap-2">
            <Badge size="xs">Extra small</Badge>
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
            <Badge size="xl">Extra large</Badge>
          </View>
          <View className="flex-row items-center gap-3">
            <Badge size="xs" count={3} />
            <Badge size="sm" count={3} />
            <Badge size="md" count={3} />
            <Badge size="lg" count={3} />
            <Badge size="xl" count={3} />
          </View>
          <View className="flex-row items-center gap-3">
            <Badge size="xs" shape="dot" variant="success" />
            <Badge size="sm" shape="dot" variant="success" />
            <Badge size="md" shape="dot" variant="success" />
            <Badge size="lg" shape="dot" variant="success" />
            <Badge size="xl" shape="dot" variant="success" />
          </View>
        </View>
      ),
    },
    {
      label: "With status dot",
      render: () => (
        <View className="gap-2">
          {(
            [
              ["success", "#10b981", "Operational"],
              ["warning", "#f59e0b", "Degraded"],
              ["destructive", "#ef4444", "Outage"],
            ] as const
          ).map(([variant, dot, text]) => (
            <Badge key={variant} variant={variant}>
              <View
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: dot }}
              />
              <Text size="xs" weight="medium">
                {text}
              </Text>
            </Badge>
          ))}
        </View>
      ),
    },
  ],
};
