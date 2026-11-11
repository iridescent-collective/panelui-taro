import { loadFontFace } from "@tarojs/taro";

import {
  getRegisteredThemeFonts,
  getRegisteredThemeTokens,
  setThemeFonts,
} from "./registry";
import type { PanelTheme, ThemeFonts, ThemeFontSources } from "./types";

const requests = new Map<string, number>();
export const loadThemeFonts = async (
  theme: PanelTheme,
  sources: ThemeFontSources
): Promise<void> => {
  getRegisteredThemeTokens(theme);
  const entries = Object.entries(sources);
  for (const [token, font] of entries) {
    if (
      !["normal", "medium", "semibold", "bold", "mono"].includes(token) ||
      !font ||
      !font.family.trim() ||
      /[;{}()"'\\]/u.test(font.family) ||
      !/^https:\/\/[^\s"'()]+$/u.test(font.source)
    ) {
      throw new RangeError(`Invalid font source: ${token}`);
    }
  }
  const previousFonts = getRegisteredThemeFonts(theme);
  const faces = [
    ...new Map(
      entries.map(([, font]) => [JSON.stringify(font), font])
    ).values(),
  ];
  const request = (requests.get(theme) ?? 0) + 1;
  requests.set(theme, request);
  await Promise.all(
    faces.map(async (font) => {
      await loadFontFace({
        desc: { style: "normal", weight: "normal" },
        family: font.family,
        global: true,
        source: `url(${JSON.stringify(font.source)})`,
      });
    })
  );
  if (
    requests.get(theme) !== request ||
    previousFonts !== getRegisteredThemeFonts(theme)
  ) {
    throw new Error("Font configuration was superseded");
  }
  const fonts: ThemeFonts = { ...getRegisteredThemeFonts(theme) };
  for (const [token, font] of entries) {
    Object.assign(fonts, { [token]: font.family });
  }
  setThemeFonts(theme, fonts);
};
