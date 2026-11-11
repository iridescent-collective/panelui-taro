import { getAppBaseInfo, onThemeChange, offThemeChange } from "@tarojs/taro";

import { isThemeRegistered } from "./registry";
import type { PanelTheme, ThemeMode, ThemeName } from "./types";

let preference: ThemeName = "light";
let systemMode: ThemeMode = "light";
const listeners = new Set<() => void>();
let systemConsumers = 0;

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

export const getThemePreference = (): ThemeName => preference;
export const getTheme = (): PanelTheme =>
  preference === "system" ? systemMode : preference;
export const subscribeTheme = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const setTheme = (next: ThemeName): void => {
  if (next !== "system" && !isThemeRegistered(next)) {
    throw new RangeError(`Unknown PanelUI theme: ${next}`);
  }
  if (preference === next) {
    return;
  }
  preference = next;
  notify();
};
export const setSystemTheme = (next: ThemeMode): void => {
  if (systemMode === next) {
    return;
  }
  systemMode = next;
  if (preference === "system") {
    notify();
  }
};
const handleSystemTheme = ({ theme }: { theme: string }) => {
  setSystemTheme(theme === "dark" ? "dark" : "light");
};

export const connectSystemTheme = (): (() => void) => {
  if (systemConsumers === 0) {
    try {
      handleSystemTheme({ theme: getAppBaseInfo().theme ?? "light" });
    } catch {
      setSystemTheme("light");
    }
    if (typeof onThemeChange === "function") {
      onThemeChange(handleSystemTheme);
    }
  }
  systemConsumers += 1;
  return () => {
    systemConsumers -= 1;
    if (systemConsumers === 0 && typeof offThemeChange === "function") {
      offThemeChange(handleSystemTheme);
    }
  };
};

export const resetTheme = (): void => {
  preference = "light";
  systemMode = "light";
  notify();
};
