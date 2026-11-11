import {
  isThemeRegistered,
  registerTheme,
  registerThemeFamily,
} from "panelui-taro/theme";

export const ensureCustomizationThemes = () => {
  if (isThemeRegistered("sunset")) {
    return;
  }
  registerTheme("sunset", {
    extends: "light",
    tokens: {
      background: "#fffaf5",
      "chart-1": "#c2410c",
      "chart-2": "#ea580c",
      "chart-3": "#f59e0b",
      "chart-4": "#16a34a",
      "chart-5": "#2563eb",
      foreground: "#2b1a12",
      primary: "#c2410c",
      "primary-foreground": "#ffffff",
      "radius-2xl": "22px",
      "radius-xl": "18px",
      ring: "#c2410c",
    },
  });
  registerTheme("sunset-dark", {
    extends: "dark",
    tokens: {
      background: "#1f1510",
      "chart-1": "#fb923c",
      "chart-2": "#fdba74",
      "chart-3": "#fcd34d",
      "chart-4": "#4ade80",
      "chart-5": "#60a5fa",
      foreground: "#fff7ed",
      primary: "#fb923c",
      "primary-foreground": "#1f1510",
      "radius-2xl": "22px",
      "radius-xl": "18px",
      ring: "#fb923c",
    },
  });
  registerThemeFamily({
    dark: "sunset-dark",
    id: "sunset",
    light: "sunset",
    name: "Sunset",
    swatch: ["#c2410c", "#fb923c"],
  });
};
