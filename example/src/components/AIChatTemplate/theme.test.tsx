// @vitest-environment happy-dom
import type * as TaroComponents from "@tarojs/components";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import {
  getTheme,
  getThemePreference,
  resetTheme,
  setTheme,
} from "../../../../src/theme/store";
import { AIChatTemplate } from "./index";
vi.mock("@tarojs/components", async (importOriginal) => {
  const actual = await importOriginal<typeof TaroComponents>();
  return { ...actual, Canvas: actual.View };
});
afterEach(resetTheme);
it("uses the shared ThemeSelector and retains Moon while switching modes", () => {
  act(() => setTheme("moon"));
  render(<AIChatTemplate />);
  fireEvent.click(screen.getByRole("button", { name: "Change theme" }));
  expect(screen.getByRole("radiogroup", { name: "Color mode" })).toBeTruthy();
  fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
  expect(getTheme()).toBe("moon-dark");
  fireEvent.click(screen.getByRole("radio", { name: "Light" }));
  expect(getTheme()).toBe("moon");
  fireEvent.click(screen.getByRole("radio", { name: "System" }));
  expect(getThemePreference()).toBe("system");
});
it("keeps the chat draft and conversation while changing a theme family", () => {
  render(<AIChatTemplate />);
  fireEvent.input(screen.getByPlaceholderText("Ask anything…"), {
    target: { value: "keep my draft" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Change theme" }));
  fireEvent.click(screen.getByRole("button", { name: "Grass" }));
  expect(getTheme()).toBe("grass");
  expect(screen.getByDisplayValue("keep my draft")).toBeTruthy();
});
