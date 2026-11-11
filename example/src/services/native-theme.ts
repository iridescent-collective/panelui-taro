import {
  setNavigationBarColor,
  setBackgroundColor,
  setBackgroundTextStyle,
  setNavigationBarTitle,
  setStorageSync,
  getStorageSync,
  useDidShow,
} from "@tarojs/taro";
import {
  useTheme,
  useThemeMode,
  useThemePreference,
  useThemeToken,
  isThemeRegistered,
} from "panelui-taro/theme";
import type { ThemeName } from "panelui-taro/theme";
import { useCallback, useEffect } from "react";

const STORAGE_KEY = "panelui-example.theme";
export const readSavedTheme = (): ThemeName => {
  try {
    const value = getStorageSync(STORAGE_KEY);
    return value === "system" ||
      (typeof value === "string" && isThemeRegistered(value))
      ? value
      : "light";
  } catch {
    return "light";
  }
};
export const syncNativeTheme = (
  background: string,
  dark: boolean,
  title?: string
) => {
  void setNavigationBarColor({
    animation: { duration: 0, timingFunc: "linear" },
    backgroundColor: background,
    frontColor: dark ? "#ffffff" : "#000000",
  });
  void setBackgroundColor({
    backgroundColor: background,
    backgroundColorBottom: background,
    backgroundColorTop: background,
  });
  void setBackgroundTextStyle({ textStyle: dark ? "light" : "dark" });
  if (title) {
    void setNavigationBarTitle({ title });
  }
};
export const useNativeTheme = (title?: string) => {
  const { theme } = useTheme();
  const { mode } = useThemeMode();
  const preference = useThemePreference();
  const background = useThemeToken("background");
  const sync = useCallback(
    () => syncNativeTheme(background, mode === "dark", title),
    [background, mode, title]
  );
  useDidShow(sync);
  useEffect(sync, [sync, theme]);
  useEffect(() => {
    setStorageSync(STORAGE_KEY, preference);
  }, [preference]);
};
