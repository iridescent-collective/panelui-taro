import { useThemeToken } from "panelui-taro/theme";

export const useCSSVariable = (token: string) =>
  useThemeToken(
    token.replace(/^--color-/u, "") as Parameters<typeof useThemeToken>[0]
  );
