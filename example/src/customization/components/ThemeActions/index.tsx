import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { useThemeMode, useThemeFamilies } from "panelui-taro/theme";
import { ThemeSelector } from "panelui-taro/theme-selector";

export const ThemeActions = () => {
  const { family, setFamily } = useThemeMode();
  const families = useThemeFamilies();
  return (
    <View className="flex flex-col gap-[24px]">
      <View className="flex flex-row flex-wrap gap-[12px]">
        {families.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={family.id === item.id ? "primary" : "outline"}
            onPress={() => setFamily(item.id)}
            accessibilityLabel={`Use ${item.name} theme`}
          >
            {item.name}
          </Button>
        ))}
      </View>
      <ThemeSelector label="Color mode" variant="card" size="sm" />
    </View>
  );
};
