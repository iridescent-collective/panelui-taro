import { useSyncExternalStore } from "react";

import {
  getThemeConfigurationVersion,
  subscribeThemeConfiguration,
  getThemeFamilies,
  getRegisteredThemeTokens,
  getRegisteredThemeStyle,
  getRegisteredThemeMode,
} from "./registry";
import {
  getTheme,
  getThemePreference,
  setTheme,
  subscribeTheme,
} from "./store";
import type { ThemeMode, ThemeToken } from "./types";

export {
  PANEL_THEMES,
  PANEL_EXTRA_THEMES,
  PANEL_THEME_NAMES,
} from "./constants";
export type {
  PanelTheme,
  PanelThemeFamily,
  ThemeMode,
  ThemeName,
} from "./types";

export const useTheme = () => {
  useSyncExternalStore(
    subscribeThemeConfiguration,
    getThemeConfigurationVersion,
    getThemeConfigurationVersion
  );
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getTheme);
  return { setTheme, theme };
};
export const useThemePreference = () =>
  useSyncExternalStore(subscribeTheme, getThemePreference, getThemePreference);
export const useThemeMode = () => {
  const { theme } = useTheme();
  const families = getThemeFamilies();
  const paired = families.find(
    (item) => item.light === theme || item.dark === theme
  );
  const { primary } = getRegisteredThemeTokens(theme);
  const family = paired ?? {
    dark: theme,
    id: theme,
    light: theme,
    name: theme,
    swatch: [primary, primary] as const,
  };
  const pairedMode: ThemeMode = theme === paired?.dark ? "dark" : "light";
  const mode: ThemeMode = paired ? pairedMode : getRegisteredThemeMode(theme);
  return {
    family,
    mode,
    setFamily: (id: string) => {
      const next = getThemeFamilies().find((item) => item.id === id);
      if (next) {
        setTheme(next[mode]);
      }
    },
    setMode: (next: ThemeMode) => setTheme(family[next]),
    toggleMode: () => setTheme(mode === "dark" ? family.light : family.dark),
  };
};
export const useThemeToken = (token: ThemeToken): string => {
  const { theme } = useTheme();
  return getRegisteredThemeTokens(theme)[token];
};

export const useThemeTokens = () => {
  const { theme } = useTheme();
  return getRegisteredThemeTokens(theme);
};
export const useThemeStyles = () => {
  const { theme } = useTheme();
  return getRegisteredThemeStyle(theme);
};
export const useThemeFamilies = () => {
  useTheme();
  return getThemeFamilies();
};
export {
  registerTheme,
  registerThemeFamily,
  getRegisteredThemeTokens,
  isThemeRegistered,
} from "./registry";
export type {
  BuiltinTheme,
  ThemeToken,
  ThemeTokens,
  ThemeFonts,
  FontToken,
  ThemeDefinition,
} from "./types";
export { loadThemeFonts } from "./fonts";
export { setThemeFonts, getRegisteredThemeFonts } from "./registry";
export type { ThemeFontSource, ThemeFontSources } from "./types";
