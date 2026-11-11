// @vitest-environment happy-dom

import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Portal } from "../src/primitives/portal";
import { resetThemeConfiguration } from "../src/theme/registry";
import { resetTheme, setTheme } from "../src/theme/store";
import * as Theme from "../src/theme/use-theme";

const Readout = () => (
  <span data-testid="ink">{Theme.useThemeToken("chart-1")}</span>
);
afterEach(() => {
  resetTheme();
  resetThemeConfiguration();
});

it("uses the same custom chart color in JS, provider WXSS and portal WXSS", () => {
  Theme.registerTheme("sunset", {
    extends: "light",
    tokens: { "chart-1": "#c2410c", primary: "#c2410c", "radius-xl": "18px" },
  });
  setTheme("sunset");
  const view = render(
    <PanelUIProvider>
      <Readout />
      <Portal>
        <span data-testid="portal">Portal</span>
      </Portal>
    </PanelUIProvider>
  );
  expect(screen.getByTestId("ink").textContent).toBe("#c2410c");
  const provider =
    view.container.querySelector<HTMLElement>(".panelui-theme");
  expect(provider?.style.getPropertyValue("--panel-chart-1")).toBe("#c2410c");
  expect(provider?.style.getPropertyValue("--panel-radius-xl")).toBe("36rpx");
  const portal = screen
    .getByTestId("portal")
    .closest<HTMLElement>(".panelui-theme");
  expect(portal?.style.getPropertyValue("--panel-chart-1")).toBe("#c2410c");
});

it("reacts to token edits without requiring a theme-name change", () => {
  render(
    <PanelUIProvider>
      <Readout />
    </PanelUIProvider>
  );
  act(() =>
    Theme.registerTheme("light", {
      extends: "light",
      tokens: { "chart-1": "#123456" },
    })
  );
  expect(screen.getByTestId("ink").textContent).toBe("#123456");
});

it("keeps a custom family when toggling mode and rejects unregistered themes", () => {
  Theme.registerTheme("sunset", { extends: "light" });
  Theme.registerTheme("sunset-dark", { extends: "dark" });
  Theme.registerThemeFamily({
    dark: "sunset-dark",
    id: "sunset",
    light: "sunset",
    name: "Sunset",
    swatch: ["#c2410c", "#fb923c"],
  });
  setTheme("sunset");
  let mode: ReturnType<typeof Theme.useThemeMode> | undefined;
  const Modes = () => {
    mode = Theme.useThemeMode();
    return <span>{mode.family.name}</span>;
  };
  render(<Modes />);
  act(() => mode?.toggleMode());
  expect(Theme.getRegisteredThemeTokens("sunset-dark").background).toBe(
    "#141414"
  );
  expect(mode?.family.id).toBe("sunset");
  expect(mode?.mode).toBe("dark");
  expect(() => setTheme("missing")).toThrow(RangeError);
});

it("validates configuration before changing an existing theme", () => {
  expect(() =>
    Theme.registerTheme("light", {
      extends: "light",
      tokens: { primary: "var(--unresolved)" },
    })
  ).toThrow();
  expect(Theme.getRegisteredThemeTokens("light").primary).toBe("#262626");
});

it("preserves a standalone dark theme and infers its mode from the Native base", () => {
  Theme.registerTheme("night", { extends: "dark" });
  setTheme("night");
  let result: ReturnType<typeof Theme.useThemeMode> | undefined;
  const Probe = () => {
    result = Theme.useThemeMode();
    return null;
  };
  render(<Probe />);
  expect(result?.mode).toBe("dark");
  act(() => result?.toggleMode());
  expect(result?.mode).toBe("dark");
  expect(result?.family.dark).toBe("night");
});
it("rejects family variants already owned by another family", () => {
  Theme.registerTheme("night", { extends: "dark" });
  expect(() =>
    Theme.registerThemeFamily({
      dark: "night",
      id: "ambiguous",
      light: "light",
      name: "Ambiguous",
      swatch: ["#fff", "#000"],
    })
  ).toThrow("already belongs");
});
