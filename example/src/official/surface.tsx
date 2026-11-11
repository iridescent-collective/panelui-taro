import { Text } from "panelui-taro/primitives/text";
import { Surface } from "panelui-taro/surface";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "surface",
  name: "Surface",
  summary: "Elevated container with a variant ladder",
  demos: [
    {
      label: "Nested hierarchy",
      render: () => (
        <Surface className="w-full">
          <Text weight="medium">Account</Text>
          <Surface variant="secondary" className="mt-3">
            <Text size="sm" muted>
              Signed in as khalid@example.com
            </Text>
            <Surface variant="tertiary" className="mt-3">
              <Text size="xs" muted>
                Session expires in 12 days
              </Text>
            </Surface>
          </Surface>
        </Surface>
      ),
    },
    {
      label: "Variants",
      render: () => (
        <View className="w-full gap-3">
          {(["default", "secondary", "tertiary", "transparent"] as const).map(
            (variant) => (
              <Surface key={variant} variant={variant}>
                <Text size="sm">{variant}</Text>
              </Surface>
            )
          )}
        </View>
      ),
    },
    {
      label: "Bordered and elevated",
      render: () => (
        <View className="w-full gap-3">
          <Surface bordered>
            <Text size="sm">bordered — reads against a same-colour page</Text>
          </Surface>

          <Surface elevated>
            <Text size="sm">elevated — a soft shadow</Text>
          </Surface>
          <Surface bordered elevated>
            <Text size="sm">both</Text>
          </Surface>
        </View>
      ),
    },
    {
      label: "Padding scale",
      render: () => (
        <View className="w-full gap-3">
          {(["none", "sm", "default", "lg"] as const).map((padding) => (
            <Surface
              key={padding}
              variant="secondary"
              padding={padding}
              bordered
            >
              <View className="bg-primary/10 rounded-lg px-2 py-1">
                <Text size="xs" muted>
                  padding={padding}
                </Text>
              </View>
            </Surface>
          ))}
        </View>
      ),
    },
    {
      label: "As a stat card",
      render: () => (
        <View className="w-full flex-row gap-3">
          {[
            { label: "Revenue", value: "$24.8k" },
            { label: "Active", value: "1,204" },
          ].map((stat) => (
            <Surface key={stat.label} bordered padding="lg" className="flex-1">
              <Text size="xs" muted className="tracking-wider uppercase">
                {stat.label}
              </Text>
              <Text size="xl" weight="semibold" className="mt-1">
                {stat.value}
              </Text>
            </Surface>
          ))}
        </View>
      ),
    },
  ],
};
