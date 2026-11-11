import type { PanelThemeFamily } from "./types";

export const PANEL_THEMES: readonly PanelThemeFamily[] = [
  {
    dark: "dark",
    id: "panel",
    light: "light",
    name: "Panel",
    swatch: ["#262626", "#f5f5f5"],
  },
  {
    dark: "moon-dark",
    id: "moon",
    light: "moon",
    name: "Moon",
    swatch: ["#5e6ad2", "#5e6ad2"],
  },
  {
    dark: "grass-dark",
    id: "grass",
    light: "grass",
    name: "Grass",
    swatch: ["#24b47e", "#3ecf8e"],
  },
];
export const PANEL_THEME_NAMES = PANEL_THEMES.flatMap((family) => [
  family.light,
  family.dark,
]);
export const PANEL_EXTRA_THEMES = PANEL_THEME_NAMES.filter(
  (name) => name !== "light" && name !== "dark"
);
