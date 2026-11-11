import logoLight from "../assets/logo-light.png";
import logoDark from "../assets/logo-dark.png";
import {
  ChevronLeftIcon,
  MoonIcon,
  SunIcon,
} from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { useThemeMode } from "panelui-taro/theme";

import { Image, Pressable, View } from "../runtime/native";
import { useSafeAreaInsets } from "../runtime/native";
import { router } from "../runtime/router";
const CIRCLE =
  "h-11 w-11 items-center justify-center rounded-full border border-border bg-surface";
export function CircleButton({
  onPress,
  label,
  children,
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={CIRCLE}
    >
      {children}
    </Pressable>
  );
}
export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  return (
    <CircleButton
      onPress={toggleMode}
      label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mode === "dark" ? (
        <SunIcon size={18} color="#f5f5f5" />
      ) : (
        <MoonIcon size={18} color="#262626" />
      )}
    </CircleButton>
  );
}
export interface ScreenHeaderProps {
  title?: string;
  showBack?: boolean;
}
export function ScreenHeader({ title, showBack = false }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const { mode } = useThemeMode();
  return (
    <View
      className="flex-row items-center justify-between px-5 pb-3"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="w-11">
        {showBack ? (
          <CircleButton onPress={() => router.back()} label="Go back">
            <ChevronLeftIcon
              size={20}
              color={mode === "dark" ? "#f5f5f5" : "#262626"}
            />
          </CircleButton>
        ) : null}
      </View>

      {title ? (
        <Text weight="semibold" size="lg">
          {title}
        </Text>
      ) : (
        <Image
          source={
            mode === "dark"
              ? logoDark
              : logoLight
          }
          style={{ width: 30, height: 30 }}
          resizeMode="contain"
          accessibilityLabel="PanelUI"
        />
      )}

      <ThemeToggle />
    </View>
  );
}
