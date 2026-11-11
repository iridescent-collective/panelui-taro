import { View } from "@tarojs/components";
import { BottomSheet } from "panelui-taro/bottom-sheet";
import { Button } from "panelui-taro/button";
import { SunIcon, MoonIcon } from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { useThemeMode, useThemeFamilies } from "panelui-taro/theme";
import { ThemeSelector } from "panelui-taro/theme-selector";
import { useState } from "react";

export const ThemeControl = () => {
  const [open, setOpen] = useState(false);
  const { family, mode, setFamily } = useThemeMode();
  const families = useThemeFamilies();
  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        accessibilityLabel="Change theme"
        onPress={() => setOpen(true)}
      >
        {mode === "dark" ? <MoonIcon size={20} /> : <SunIcon size={20} />}
      </Button>
      <BottomSheet open={open} onOpenChange={setOpen}>
        <BottomSheet.Content>
          <View className="flex flex-col gap-[32px] pb-[32px]">
            <Text weight="semibold" className="block">
              Theme
            </Text>
            <View className="flex flex-row flex-wrap gap-[16px]">
              {families.map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={family.id === item.id ? "primary" : "outline"}
                  onPress={() => setFamily(item.id)}
                >
                  {item.name}
                </Button>
              ))}
            </View>
            <ThemeSelector label="Color mode" variant="card" />
          </View>
        </BottomSheet.Content>
      </BottomSheet>
    </>
  );
};
