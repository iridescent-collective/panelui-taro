// @vitest-environment happy-dom
import "../../../test/geometry-renderer";
import { loadFontFace, setClipboardData } from "@tarojs/taro";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { getRegisteredThemeFonts, useThemeToken } from "panelui-taro/theme";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { resetThemeConfiguration } from "../../../src/theme/registry";
import { resetTheme } from "../../../src/theme/store";
import { ChartExplorer } from "../customization/components/ChartExplorer";
import { ColorExplorer } from "../customization/components/ColorExplorer";
import { FontExplorer } from "../customization/components/FontExplorer";
import { IconExplorer } from "../customization/components/IconExplorer";
import { SizingExplorer } from "../customization/components/SizingExplorer";
import { StylingExplorer } from "../customization/components/StylingExplorer";
import { ThemeExplorer } from "../customization/components/ThemeExplorer";
import { ensureCustomizationThemes } from "../customization/theme-config";
import { setTestMeasurement } from "./taro-api";

beforeEach(() => {
  ensureCustomizationThemes();
  setTestMeasurement(320, 375);
});
afterEach(() => {
  resetTheme();
  resetThemeConfiguration();
});
const CurrentPrimary = () => (
  <span data-testid="primary">{useThemeToken("primary")}</span>
);
it("keeps the custom family when toggling mode and propagates it to the dialog portal", async () => {
  render(
    <>
      <ThemeExplorer />
      <CurrentPrimary />
    </>
  );
  fireEvent.click(screen.getByRole("button", { name: "Use Sunset theme" }));
  expect(screen.getByTestId("primary").textContent).toBe("#c2410c");
  fireEvent.click(screen.getByRole("button", { name: "Toggle color mode" }));
  expect(screen.getByText("Sunset / dark / sunset-dark")).toBeTruthy();
  expect(screen.getByTestId("primary").textContent).toBe("#fb923c");
  fireEvent.click(
    screen.getByRole("button", { name: "Preview themed dialog" })
  );
  await waitFor(() =>
    expect(
      screen
        .getByText("Theme preview")
        .closest<HTMLElement>(".panelui-theme")
        ?.style.getPropertyValue("--panel-primary")
    ).toBe("#fb923c")
  );
  fireEvent.click(screen.getByRole("button", { name: "Close preview" }));
  await waitFor(() => expect(screen.queryByText("Theme preview")).toBeNull());
});
it("loads and restores fonts without losing other tokens when changing monospace", async () => {
  render(<FontExplorer />);
  fireEvent.click(screen.getByRole("button", { name: "Load Pacifico sample" }));
  await screen.findByText("Pacifico loaded for light.");
  expect(loadFontFace).toHaveBeenCalledTimes(1);
  expect(getRegisteredThemeFonts("light").bold).toBe("PanelPacifico");
  fireEvent.click(screen.getByRole("button", { name: "Set monospace token" }));
  expect(getRegisteredThemeFonts("light")).toMatchObject({
    bold: "PanelPacifico",
    mono: "Courier New",
  });
  fireEvent.click(screen.getByRole("button", { name: "Restore system fonts" }));
  expect(getRegisteredThemeFonts("light")).toEqual({});
});
it("filters icons, adjusts their SVG properties and copies an exported JSX tag", async () => {
  render(<IconExplorer />);
  expect(screen.getByText("Filled icons")).toBeTruthy();
  expect(screen.getByText("Right to left")).toBeTruthy();
  fireEvent.input(screen.getByRole("textbox", { name: "Search icons" }), {
    target: { value: "HeartIcon" },
  });
  const tile = screen.getByRole("button", { name: "Copy HeartIcon" });
  expect(screen.queryByRole("button", { name: "Copy SearchIcon" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Icon size 32" }));
  fireEvent.click(screen.getByRole("button", { name: "Icon weight 3" }));
  expect(
    decodeURIComponent(tile.querySelector("img")?.getAttribute("src") ?? "")
  ).toContain('stroke-width="3"');
  await act(async () => {
    fireEvent.click(tile);
  });
  expect(setClipboardData).toHaveBeenCalledWith(
    expect.objectContaining({ data: "<HeartIcon />" })
  );
  expect(screen.getByText("Copied <HeartIcon />")).toBeTruthy();
  fireEvent.input(screen.getByRole("textbox", { name: "Search icons" }), {
    target: { value: "no-such-icon" },
  });
  expect(screen.getByText("No icons match this search.")).toBeTruthy();
});
it("changes related control sizes and shares checkbox state with the switch", () => {
  render(<SizingExplorer />);
  fireEvent.click(screen.getByRole("button", { name: "Use xl size" }));
  expect(
    screen.getByRole("button", { name: "Button / xl" }).className
  ).toContain("min-h-[112px]");
  expect(screen.getByPlaceholderText("Input / xl")).toBeTruthy();
  expect(screen.getByText("Switch / xl")).toBeTruthy();
  fireEvent.click(screen.getByRole("checkbox", { name: "Checkbox / xl" }));
  expect(
    screen
      .getByRole("switch", { name: "Switch / xl" })
      .getAttribute("aria-checked")
  ).toBe("true");
});
it("copies semantic color references and renders both series examples", async () => {
  const view = render(<ColorExplorer />);
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Copy primary color token" })
    );
  });
  expect(setClipboardData).toHaveBeenCalledWith(
    expect.objectContaining({ data: "var(--panel-primary)" })
  );
  view.unmount();
  render(<ChartExplorer />);
  fireEvent.click(screen.getByRole("button", { name: "Use Sunset theme" }));
  expect(screen.getByText("One series ramp")).toBeTruthy();
  expect(screen.getByText("Override one series")).toBeTruthy();
  await waitFor(() =>
    expect(screen.getAllByText("Organic").length).toBeGreaterThan(1)
  );
  const images = [...document.querySelectorAll("img")]
    .map((image) => decodeURIComponent(image.getAttribute("src") ?? ""))
    .join(" ");
  expect(images).toContain("#c2410c");
  expect(images).toContain("#ea580c");
});
it("changes the className-based styling sample", () => {
  render(<StylingExplorer />);
  fireEvent.click(
    screen.getByRole("button", { name: "Toggle rounded override" })
  );
  expect(
    screen.getByRole("button", { name: "Class merge example" }).className
  ).toContain("rounded-full");
});

it("keeps existing fonts after a failed load and allows a successful retry", async () => {
  vi.mocked(loadFontFace).mockRejectedValueOnce(new Error("CORS"));
  render(<FontExplorer />);
  fireEvent.click(screen.getByRole("button", { name: "Load Pacifico sample" }));
  await screen.findByText(/Font download failed/u);
  expect(getRegisteredThemeFonts("light")).toEqual({});
  fireEvent.click(screen.getByRole("button", { name: "Load Pacifico sample" }));
  await screen.findByText("Pacifico loaded for light.");
  expect(getRegisteredThemeFonts("light").normal).toBe("PanelPacifico");
});

it("custom glyph preview follows the shared icon controls through the public factory", () => {
  render(<IconExplorer />);
  const preview = screen.getByTestId("custom-glyph");
  expect(preview.parentElement?.style.transform).toBe("scaleX(1)");
  fireEvent.click(screen.getByRole("switch", { name: "Right to left" }));
  expect(preview.parentElement?.style.transform).toBe("scaleX(-1)");
  fireEvent.click(screen.getByRole("button", { name: "Icon weight 3" }));
  expect(decodeURIComponent(preview.getAttribute("src") ?? "")).toContain(
    'stroke-width="3"'
  );
  expect(screen.queryByRole("button", { name: "Copy createIcon" })).toBeNull();
});
