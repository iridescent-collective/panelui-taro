import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { useTheme } from "panelui-taro/theme";
import { ArrowLeft, Moon, Sun } from "lucide-react-taro";

import { SCREENS } from "../../constant";
import { Glyph } from "../Glyph";
import { Text } from "../Text";

export const TemplateHeader = ({
  value,
  onBack,
}: {
  value: string;
  onBack?: () => void;
}) => {
  const screen = SCREENS.find((entry) => entry.id === value) ?? SCREENS[0];
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";
  return (
    <View className="flex flex-col gap-[28px] px-[36px] pt-[32px] pb-[28px]">
      <View className="flex flex-row items-center justify-between">
        <Text size="xs" muted className="tracking-[4px]">
          PANELUI / DAILY LIFE
        </Text>
        <Text size="xs" muted>
          INTERACTIVE DEMO
        </Text>
      </View>
      <View className="flex flex-row items-center gap-[20px]">
        {onBack ? (
          <Button
            size="icon"
            variant="outline"
            accessibilityLabel="Back to components"
            onPress={onBack}
          >
            <Glyph icon={ArrowLeft} size={20} />
          </Button>
        ) : null}
        <View className="flex min-w-0 flex-1 flex-col gap-[8px]">
          <Text className="text-[40px] font-semibold">{screen.title}</Text>
          <Text size="sm" muted>
            {screen.subtitle}
          </Text>
        </View>
        <Button
          size="icon"
          variant="secondary"
          accessibilityLabel={dark ? "Use light theme" : "Use dark theme"}
          onPress={() => setTheme(dark ? "light" : "dark")}
        >
          {dark ? (
            <Glyph icon={Sun} size={20} />
          ) : (
            <Glyph icon={Moon} size={20} />
          )}
        </Button>
      </View>
    </View>
  );
};
