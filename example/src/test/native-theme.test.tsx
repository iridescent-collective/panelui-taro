import {
  getStorageSync,
  setNavigationBarColor,
  setBackgroundColor,
  setBackgroundTextStyle,
} from "@tarojs/taro";
// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { setTheme, setSystemTheme, resetTheme } from "../../../src/theme/store";
import { THEME_TOKENS } from "../../../src/theme/tokens";
import { useNativeTheme, readSavedTheme } from "../services/native-theme";

afterEach(resetTheme);
for (const [theme, tokens] of Object.entries(THEME_TOKENS)) {
  it(`synchronizes ${theme} surfaces with the native navigation and status bar`, () => {
    act(() => setTheme(theme as keyof typeof THEME_TOKENS));
    renderHook(() => useNativeTheme("Accordion · PanelUI"));
    const dark = theme === "dark" || theme.endsWith("-dark");
    expect(setNavigationBarColor).toHaveBeenLastCalledWith(
      expect.objectContaining({
        backgroundColor: tokens.background,
        frontColor: dark ? "#ffffff" : "#000000",
      })
    );
    expect(setBackgroundColor).toHaveBeenLastCalledWith({
      backgroundColor: tokens.background,
      backgroundColorBottom: tokens.background,
      backgroundColorTop: tokens.background,
    });
    expect(setBackgroundTextStyle).toHaveBeenLastCalledWith({
      textStyle: dark ? "light" : "dark",
    });
  });
}
it("updates the native bar when the system changes while following system mode", () => {
  act(() => {
    setTheme("system");
    setSystemTheme("light");
  });
  renderHook(() => useNativeTheme());
  act(() => setSystemTheme("dark"));
  expect(setNavigationBarColor).toHaveBeenLastCalledWith(
    expect.objectContaining({
      backgroundColor: THEME_TOKENS.dark.background,
      frontColor: "#ffffff",
    })
  );
});
it("validates a saved preference before restoring it", () => {
  vi.mocked(getStorageSync).mockReturnValueOnce("grass-dark");
  expect(readSavedTheme()).toBe("grass-dark");
  vi.mocked(getStorageSync).mockReturnValueOnce("unknown-theme");
  expect(readSavedTheme()).toBe("light");
});
