import { Text } from "panelui-taro/primitives/text";
import {
  ThemeSelector,
  type ThemeSelection,
} from "panelui-taro/theme-selector";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function ThemeSelectorStoredDemo() {
  const [choice, setChoice] = useState<ThemeSelection>("system");
  return (
    <View className="w-full gap-3">
      <ThemeSelector
        label="Appearance"
        value={choice}
        applyTheme={false}
        onValueChange={setChoice}
      />
      <Text size="sm" muted>
        Stored as “{choice}” — nothing has changed the theme.
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "theme-selector",
  name: "ThemeSelector",
  summary: "Light, dark or the device, drawn as three miniature screens",
  demos: [
    {
      label: "Three options and a heading",
      render: () => <ThemeSelector label="Choose a theme" />,
    },
    {
      label: "The other drawing",
      render: () => <ThemeSelector variant="card" label="Appearance" />,
    },
    {
      label: "Smaller",
      render: () => <ThemeSelector size="sm" variant="card" />,
    },
    {
      label: "Light and dark only",
      render: () => (
        <ThemeSelector label="Appearance">
          <ThemeSelector.Option value="light" />
          <ThemeSelector.Option value="dark" />
        </ThemeSelector>
      ),
    },
    { label: "Storing the choice", render: () => <ThemeSelectorStoredDemo /> },
  ],
};
