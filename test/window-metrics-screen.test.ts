import { beforeEach, expect, it, vi } from "vitest";

import { readWindowMetrics } from "../src/hooks/use-window-metrics";

const state = vi.hoisted(() => ({
  env: "WEAPP",
  screenTop: 82,
  capsuleBottom: 79,
  width: 390,
}));
vi.mock("@tarojs/taro", () => ({
  ENV_TYPE: { WEAPP: "WEAPP" },
  getDeviceInfo: () => ({ platform: "devtools" }),
  getEnv: () => state.env,
  getMenuButtonBoundingClientRect: () => ({ bottom: state.capsuleBottom }),
  getWindowInfo: () => ({
    safeArea: { bottom: 810, left: 0, right: 390, top: 47 },
    screenHeight: 844,
    screenTop: state.screenTop,
    screenWidth: 390,
    windowHeight: 762,
    windowWidth: state.width,
  }),
  offWindowResize: vi.fn(),
  onWindowResize: vi.fn(),
}));
beforeEach(() => {
  state.env = "WEAPP";
  state.screenTop = 82;
  state.capsuleBottom = 79;
  state.width = 390;
});

it("keeps native root portal controls below the screen safe area", () => {
  const metrics = readWindowMetrics("screen");
  expect(metrics.height).toBeCloseTo((844 * 375) / 390);
  expect(metrics.insets.top).toBeCloseTo((47 * 375) / 390);
  expect(metrics.insets.bottom).toBeCloseTo((34 * 375) / 390);
});

it("preserves page-local metrics for normal content and web", () => {
  expect(readWindowMetrics().height).toBeCloseTo((762 * 375) / 390);
  expect(readWindowMetrics().insets.top).toBe(0);
  state.env = "WEB";
  expect(readWindowMetrics("screen").height).toBeCloseTo((762 * 375) / 390);
});

it("keeps top notifications below the capsule on custom navigation pages", () => {
  state.screenTop = 0;
  expect(readWindowMetrics().overlayTop).toBeCloseTo((79 * 375) / 390);
});
it("subtracts native navigation origin and retains screen coordinates for root overlays", () => {
  expect(readWindowMetrics().overlayTop).toBe(0);
  expect(readWindowMetrics("screen").overlayTop).toBeCloseTo((79 * 375) / 390);
});
it("preserves system safe area outside WeChat and for invalid capsule geometry", () => {
  state.screenTop = 0;
  state.env = "WEB";
  expect(readWindowMetrics().overlayTop).toBeCloseTo((47 * 375) / 390);
  state.env = "WEAPP";
  state.capsuleBottom = 0;
  expect(readWindowMetrics().overlayTop).toBeCloseTo((91 * 375) / 390);
});

it.each([
  { width: 320, bottom: 56 },
  { width: 375, bottom: 64 },
  { width: 390, bottom: 79 },
  { width: 430, bottom: 91 },
])(
  "uses measured capsule geometry at width $width and bottom $bottom",
  ({ width, bottom }) => {
    state.screenTop = 0;
    state.width = width;
    state.capsuleBottom = bottom;
    const actualTop = ((readWindowMetrics().overlayTop + 16) * width) / 375;
    expect(actualTop).toBeCloseTo(bottom + (16 * width) / 375);
    expect(actualTop).toBeGreaterThan(bottom);
  }
);
