// @vitest-environment happy-dom

import type * as TaroComponents from "@tarojs/components";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { dispatchTaroEvent, TARO_TEST_EVENTS } from "@/test/taro-components";

import { ActivityScreen } from "./components/Activity";
import { HomeScreen } from "./components/Home";
import { SettingsScreen } from "./components/Settings";
import { TravelScreen } from "./components/Travel";
import { WalletScreen } from "./components/Wallet";
import { OfficialTemplate } from "./index";

vi.mock("@tarojs/components", async (importOriginal) => {
  const actual = await importOriginal<typeof TaroComponents>();
  return { ...actual, Canvas: actual.View };
});

it("applies scenes and clears their selection after manual device control", () => {
  render(<HomeScreen />);
  fireEvent.click(screen.getByText("Away"));
  expect(screen.getByText("Devices · 0 on")).toBeTruthy();
  fireEvent.click(screen.getByRole("switch", { name: "Ceiling light" }));
  expect(screen.getByText("Devices · 1 on")).toBeTruthy();
  fireEvent.click(screen.getByText("Kitchen"));
  expect(screen.getByText("Coffee machine")).toBeTruthy();
  fireEvent.click(screen.getByText("Living room"));
  expect(screen.getByText("Devices · 1 on")).toBeTruthy();
});

it("keeps independent card balances and blocks outgoing actions when frozen", () => {
  render(<WalletScreen />);
  fireEvent.click(screen.getByText("Top up"));
  expect(screen.getByText("€12,580.36")).toBeTruthy();
  fireEvent.click(screen.getByText("Send"));
  expect(screen.getByText("€12,555.36")).toBeTruthy();
  fireEvent.click(screen.getByText("Freeze"));
  expect(screen.getByText("Card frozen")).toBeTruthy();
  expect(screen.getByText("Send").closest("button")?.disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Select Travel card" }));
  expect(screen.getByText("€1,186.40")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Select Everyday card" }));
  expect(screen.getByText("Card frozen")).toBeTruthy();
  expect(screen.getByText("€3,315.18")).toBeTruthy();
});

it("switches goals and body readings together", () => {
  render(<ActivityScreen />);
  fireEvent.click(screen.getByText("Week"));
  expect(screen.getByText("Last 7 days")).toBeTruthy();
  expect(screen.getAllByText("61,840").length).toBeGreaterThan(0);
  expect(screen.getByText("44.8 km")).toBeTruthy();
  fireEvent.click(screen.getByText("Month"));
  expect(screen.getByText("183 km")).toBeTruthy();
});

it("retains the note when its accordion closes and reopens", () => {
  render(<SettingsScreen />);
  const title = screen.getByText("A note for your next adventure");
  fireEvent.click(title);
  fireEvent.input(
    screen.getByPlaceholderText("Somewhere you would love to go…"),
    { target: { value: "Copenhagen" } }
  );
  fireEvent.click(title);
  fireEvent.click(title);
  expect(screen.getByDisplayValue("Copenhagen")).toBeTruthy();
  fireEvent.click(screen.getByText("Where does this design come from?"));
  expect(screen.getByText(/Adapted from PanelUI/u)).toBeTruthy();
});

it("keeps the boarding code locked until the confirmation action completes", async () => {
  render(<TravelScreen />);
  expect(
    screen.queryByText("Demo boarding code · Not valid for travel")
  ).toBeNull();
  await act(async () => {
    dispatchTaroEvent(
      screen.getByRole("button", { name: "Complete demo check-in" }),
      TARO_TEST_EVENTS.longPress,
      {}
    );
  });
  expect(
    screen.getByText("Demo boarding code · Not valid for travel")
  ).toBeTruthy();
  expect(screen.getByText("Checked in · Have a good flight")).toBeTruthy();
});

it("preserves wallet state when navigating between template screens", () => {
  render(<OfficialTemplate />);
  fireEvent.click(screen.getByRole("button", { name: "Wallet" }));
  fireEvent.click(screen.getByText("Top up"));
  fireEvent.click(screen.getByRole("button", { name: "Home" }));
  fireEvent.click(screen.getByRole("button", { name: "Wallet" }));
  expect(screen.getByText("€12,580.36")).toBeTruthy();
});
