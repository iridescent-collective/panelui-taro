import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { Separator } from "panelui-taro/separator";
import { Surface } from "panelui-taro/surface";

import { demoAction } from "../runtime/demo-action";
import { View } from "../runtime/native";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "separator",
  name: "Separator",
  summary: "Horizontal or vertical rule between content",
  demos: [
    {
      label: "Between sections",
      render: () => (
        <Surface variant="secondary" className="w-full px-6 py-7">
          <Text weight="medium">PanelUI</Text>
          <Text size="sm" muted>
            A React Native component library.
          </Text>
          <Separator className="my-4" />
          <View className="h-5 flex-row items-center">
            <Text size="sm">Components</Text>
            <Separator orientation="vertical" className="mx-3" />
            <Text size="sm">Themes</Text>
            <Separator orientation="vertical" className="mx-3" />
            <Text size="sm">Examples</Text>
          </View>
        </Surface>
      ),
    },
    {
      label: "Labelled",
      render: () => (
        <View className="w-full gap-4">
          <Button
            variant="outline"
            fullWidth
            onPress={demoAction("Continue with email")}
          >
            Continue with email
          </Button>
          <Separator>or</Separator>
          <Button
            variant="outline"
            fullWidth
            onPress={demoAction("Continue as guest")}
          >
            Continue as guest
          </Button>
        </View>
      ),
    },
    {
      label: "Variants",
      render: () => (
        <View className="w-full gap-5">
          <View className="gap-2">
            <Text size="sm" muted>
              thin
            </Text>
            <Separator />
          </View>
          <View className="gap-2">
            <Text size="sm" muted>
              thick
            </Text>
            <Separator variant="thick" />
          </View>
        </View>
      ),
    },
    {
      label: "Custom thickness",
      render: () => (
        <View className="w-full gap-5">
          {[1, 3, 6].map((thickness) => (
            <View key={thickness} className="gap-2">
              <Text size="sm" muted>
                thickness={thickness}
              </Text>
              <Separator thickness={thickness} />
            </View>
          ))}
        </View>
      ),
    },
    {
      label: "Vertical, stretched by the row",
      render: () => (
        <View className="w-full flex-row items-stretch gap-4 py-2">
          {["Today", "Week", "Month"].map((label, index) => (
            <View key={label} className="flex-1 flex-row items-stretch gap-4">
              {index > 0 ? <Separator orientation="vertical" /> : null}
              <View className="flex-1 gap-1">
                <Text size="xs" muted className="tracking-wider uppercase">
                  {label}
                </Text>
                <Text size="lg" weight="semibold">
                  {[128, 904, 3612][index]?.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ),
    },
  ],
};
