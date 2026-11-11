import type { THEME_TOKENS } from "./tokens";

export type PanelTheme = string;
export type ThemeName = PanelTheme | "system";
export type ThemeMode = "light" | "dark";
export type ThemeToken = keyof (typeof THEME_TOKENS)["light"];

export interface PanelThemeFamily {
  id: string;
  name: string;
  light: PanelTheme;
  dark: PanelTheme;
  swatch: [string, string];
}

export type BuiltinTheme = keyof typeof THEME_TOKENS;
export type ThemeTokens = Readonly<Record<ThemeToken, string>>;
export type FontToken = "normal" | "medium" | "semibold" | "bold" | "mono";
export type ThemeFonts = Partial<Record<FontToken, string>>;
export interface ThemeDefinition {
  extends: BuiltinTheme;
  tokens?: Partial<Record<ThemeToken, string>>;
  fonts?: ThemeFonts;
}

export interface ThemeFontSource {
  family: string;
  source: string;
}
export type ThemeFontSources = Partial<Record<FontToken, ThemeFontSource>>;
