import type { CSSProperties } from "react";

import { parseColor, withColorAlpha } from "../lib/color";
import { PANEL_THEMES } from "./constants";
import { OPACITY_TOKENS } from "./opacity-tokens";
import { THEME_TOKENS } from "./tokens";
import type {
  BuiltinTheme,
  PanelTheme,
  PanelThemeFamily,
  ThemeDefinition,
  ThemeFonts,
  ThemeTokens,
  ThemeMode,
} from "./types";

interface RegisteredTheme {
  mode: ThemeMode;
  fonts: ThemeFonts;
  tokens: ThemeTokens;
  style: CSSProperties;
}
const EMPTY_FONTS: ThemeFonts = Object.freeze({});
const themes = new Map<string, RegisteredTheme>();
const families = new Map<string, PanelThemeFamily>();
const listeners = new Set<() => void>();
let revision = 0;
let familyList = PANEL_THEMES;
const emit = () => {
  revision += 1;
  familyList = [...PANEL_THEMES, ...families.values()];
  for (const listener of listeners) {
    listener();
  }
};
export const subscribeThemeConfiguration = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const getThemeConfigurationVersion = () => revision;
export const getThemeFamilies = () => familyList;
export const isThemeRegistered = (name: string) =>
  themes.has(name) || Object.hasOwn(THEME_TOKENS, name);
export const getRegisteredThemeMode = (name: PanelTheme): ThemeMode =>
  themes.get(name)?.mode ??
  (PANEL_THEMES.some((family) => family.dark === name) ? "dark" : "light");
export const getRegisteredThemeTokens = (name: PanelTheme): ThemeTokens => {
  const registered = themes.get(name);
  if (registered) {
    return registered.tokens;
  }
  if (Object.hasOwn(THEME_TOKENS, name)) {
    return THEME_TOKENS[name as BuiltinTheme];
  }
  throw new RangeError(`Unknown PanelUI theme: ${name}`);
};
const validateName = (name: string) => {
  if (!/^[a-z][a-z0-9-]*$/u.test(name) || name === "system") {
    throw new RangeError(`Invalid PanelUI theme name: ${name}`);
  }
};
const validateTokens = (tokens: ThemeDefinition["tokens"]) => {
  for (const [name, value] of Object.entries(tokens ?? {})) {
    if (!Object.hasOwn(THEME_TOKENS.light, name) || typeof value !== "string") {
      throw new RangeError(`Unknown PanelUI token: ${name}`);
    }
    const valid = name.startsWith("radius-")
      ? /^\d+(?:\.\d+)?px$/u.test(value) &&
        Number.isFinite(Number(value.slice(0, -2)))
      : parseColor(value) !== null;
    if (!valid) {
      throw new RangeError(`Invalid PanelUI token value: ${name}`);
    }
  }
};
const validateFonts = (fonts: ThemeFonts) => {
  for (const [name, family] of Object.entries(fonts)) {
    if (
      !["normal", "medium", "semibold", "bold", "mono"].includes(name) ||
      typeof family !== "string" ||
      !family.trim() ||
      /[;{}()"'\\]/u.test(family)
    ) {
      throw new RangeError(`Invalid PanelUI font: ${name}`);
    }
  }
};
const themeStyle = (tokens: ThemeTokens, fonts: ThemeFonts): CSSProperties => {
  const variables: Record<string, string> = {};
  for (const [name, value] of Object.entries(tokens)) {
    variables[`--panel-${name}`] = name.startsWith("radius-")
      ? `${Number(value.slice(0, -2)) * 2}rpx`
      : value;
  }
  for (const [token, percentage] of OPACITY_TOKENS) {
    const color = tokens[token];
    const parsed = parseColor(color);
    variables[`--panel-${token}-opacity-${percentage}`] = withColorAlpha(
      color,
      ((parsed?.a ?? 1) * percentage) / 100
    );
  }
  for (const [weight, family] of Object.entries(fonts)) {
    variables[`--panel-font-${weight}`] = family;
    if (weight !== "mono") {
      variables[`--panel-font-${weight}-weight`] = "400";
    }
  }
  return variables as CSSProperties;
};
export const registerTheme = (name: string, definition: ThemeDefinition) => {
  validateName(name);
  if (!Object.hasOwn(THEME_TOKENS, definition.extends)) {
    throw new RangeError(`Unknown base theme: ${definition.extends}`);
  }
  validateTokens(definition.tokens);
  const fonts = { ...definition.fonts };
  validateFonts(fonts);
  const tokens = Object.freeze({
    ...THEME_TOKENS[definition.extends],
    ...definition.tokens,
  });
  themes.set(name, {
    fonts: Object.freeze(fonts),
    mode: getRegisteredThemeMode(definition.extends),
    style: themeStyle(tokens, fonts),
    tokens,
  });
  emit();
};
export const registerThemeFamily = (family: PanelThemeFamily) => {
  validateName(family.id);
  if (PANEL_THEMES.some((entry) => entry.id === family.id)) {
    throw new RangeError(`Built-in theme family: ${family.id}`);
  }
  if (
    family.light === family.dark ||
    !isThemeRegistered(family.light) ||
    !isThemeRegistered(family.dark)
  ) {
    throw new RangeError("A theme family needs two registered variants");
  }
  for (const variant of [family.light, family.dark]) {
    if (
      getThemeFamilies().some(
        (entry) =>
          entry.id !== family.id &&
          (entry.light === variant || entry.dark === variant)
      )
    ) {
      throw new RangeError(
        `Theme ${variant} already belongs to another family`
      );
    }
  }
  if (
    !family.name.trim() ||
    family.swatch.length !== 2 ||
    family.swatch.some((color) => !parseColor(color))
  ) {
    throw new RangeError("Invalid theme family metadata");
  }
  families.set(
    family.id,
    Object.freeze({ ...family, swatch: [...family.swatch] as [string, string] })
  );
  emit();
};
export const getRegisteredThemeStyle = (name: PanelTheme): CSSProperties =>
  themes.get(name)?.style ?? {};
export const getRegisteredThemeFonts = (name: PanelTheme): ThemeFonts =>
  themes.get(name)?.fonts ?? EMPTY_FONTS;
export const resetThemeConfiguration = () => {
  themes.clear();
  families.clear();
  emit();
};

export const setThemeFonts = (name: PanelTheme, values: ThemeFonts) => {
  validateFonts(values);
  const tokens = getRegisteredThemeTokens(name);
  const fonts = Object.freeze({ ...values });
  themes.set(name, {
    fonts,
    mode: getRegisteredThemeMode(name),
    style: themeStyle(tokens, fonts),
    tokens,
  });
  emit();
};
