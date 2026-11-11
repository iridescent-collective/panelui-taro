// @vitest-environment happy-dom

import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Portal } from "../src/primitives/portal";
import { resetThemeConfiguration } from "../src/theme/registry";
import { resetTheme } from "../src/theme/store";
import * as Theme from "../src/theme/use-theme";
import { loadFontFace } from "./taro-api";

afterEach(() => {
  resetTheme();
  resetThemeConfiguration();
});
it("loads a font with the WeChat API before applying its weight token to pages and portals", async () => {
  const view = render(
    <PanelUIProvider>
      <span>Text</span>
      <Portal>
        <span data-testid="portal-font">Overlay</span>
      </Portal>
    </PanelUIProvider>
  );
  await act(async () =>
    Theme.loadThemeFonts("light", {
      mono: { family: "PanelMono", source: "https://example.com/mono.woff" },
      normal: { family: "PanelDemo", source: "https://example.com/demo.ttf" },
    })
  );
  expect(loadFontFace).toHaveBeenCalledWith(
    expect.objectContaining({
      family: "PanelDemo",
      global: true,
      source: 'url("https://example.com/demo.ttf")',
    })
  );
  expect(
    view.container
      .querySelector<HTMLElement>(".panelui-theme")
      ?.style.getPropertyValue("--panel-font-normal")
  ).toBe("PanelDemo");
  expect(
    screen
      .getByTestId("portal-font")
      .closest<HTMLElement>(".panelui-theme")
      ?.style.getPropertyValue("--panel-font-mono")
  ).toBe("PanelMono");
});
it("keeps the current font configuration when the font download fails", async () => {
  Theme.setThemeFonts("light", { normal: "Existing" });
  vi.mocked(loadFontFace).mockRejectedValueOnce(new Error("Download failed"));
  await expect(
    Theme.loadThemeFonts("light", {
      normal: { family: "New", source: "https://example.com/new.ttf" },
    })
  ).rejects.toThrow("Download failed");
  expect(Theme.getRegisteredThemeFonts("light").normal).toBe("Existing");
});
it("rejects insecure font URLs before calling the platform loader", async () => {
  await expect(
    Theme.loadThemeFonts("light", {
      normal: { family: "Unsafe", source: "http://example.com/font.ttf" },
    })
  ).rejects.toThrow();
  expect(loadFontFace).not.toHaveBeenCalled();
});

it("does not reapply a pending font after the host restores its font configuration", async () => {
  let finish!: () => void;
  vi.mocked(loadFontFace).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = () => resolve({ errMsg: "loadFontFace:ok", status: "loaded" });
      })
  );
  const pending = Theme.loadThemeFonts("light", {
    normal: { family: "Pending", source: "https://example.com/pending.ttf" },
  });
  Theme.setThemeFonts("light", {});
  finish();
  await expect(pending).rejects.toThrow("superseded");
  expect(Theme.getRegisteredThemeFonts("light")).toEqual({});
});
it("downloads a shared face only once for multiple weight tokens", async () => {
  const face = { family: "Shared", source: "https://example.com/shared.ttf" };
  await Theme.loadThemeFonts("light", {
    bold: face,
    medium: face,
    normal: face,
  });
  expect(loadFontFace).toHaveBeenCalledTimes(1);
  expect(Theme.getRegisteredThemeFonts("light")).toMatchObject({
    bold: "Shared",
    medium: "Shared",
    normal: "Shared",
  });
});
