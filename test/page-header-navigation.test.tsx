// @vitest-environment happy-dom
import { act, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

let PageHeader: typeof import("../src/components/PageHeader").PageHeader;
import { setElementMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";
const state = vi.hoisted(() => ({
  env: "WEAPP",
  width: 390,
  status: 47,
  menu: { top: 51, bottom: 83, left: 296, width: 87, height: 32 },
  ticks: [] as (() => void)[],
  resize: undefined as (() => void) | undefined,
}));
vi.mock("@tarojs/taro", async (original) => ({
  ...(await original<object>()),
  ENV_TYPE: { WEAPP: "WEAPP" },
  getEnv: () => state.env,
  getWindowInfo: () => ({
    windowWidth: state.width,
    statusBarHeight: state.status,
  }),
  getMenuButtonBoundingClientRect: () => state.menu,
  nextTick: (fn: () => void) => state.ticks.push(fn),
  onWindowResize: (fn: () => void) => {
    state.resize = fn;
  },
  offWindowResize: (fn: () => void) => {
    if (state.resize === fn) state.resize = undefined;
  },
}));
beforeEach(async () => {
  vi.resetModules();
  PageHeader = (await import("../src/components/PageHeader")).PageHeader;
  state.env = "WEAPP";
  state.width = 390;
  state.status = 47;
  state.menu = { top: 51, bottom: 83, left: 296, width: 87, height: 32 };
  state.ticks = [];
  setElementMeasurement("navigation-geometry", null);
});
const header = (fixed = true) => (
  <PageHeader
    navigation
    fixed={fixed}
    variant="page"
    id="navigation-geometry"
    data-testid="header"
  >
    <PageHeader.Row data-testid="row">
      <PageHeader.Title>Title</PageHeader.Title>
    </PageHeader.Row>
  </PageHeader>
);
it("reserves status bar, capsule and a physical-pixel fixed placeholder", () => {
  render(header());
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-status-bar"))
  ).toContain('"height":"47px"');
  expect(
    readTaroStyle(
      document.querySelector(".panel-page-header-navigation-content")
    )
  ).toContain('"paddingRight":"102px"');
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-placeholder"))
  ).toContain('"height":"87px"');
  expect(readTaroStyle(screen.getByTestId("row"))).toContain(
    '"minHeight":"40px"'
  );
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-placeholder"))
  ).toContain('"height":"87px"');
});
it("retries incomplete launch metrics and updates after window resize", () => {
  state.menu = { top: 0, bottom: 0, left: 0, width: 0, height: 0 };
  const tree = render(header());
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-placeholder"))
  ).toContain('"height":"91px"');
  act(() => {
    state.menu = { top: 51, bottom: 83, left: 296, width: 87, height: 32 };
    state.ticks.splice(0).forEach((fn) => fn());
  });
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-placeholder"))
  ).toContain('"height":"87px"');
  act(() => {
    state.width = 430;
    state.menu.left = 336;
    state.resize?.();
  });
  expect(
    readTaroStyle(
      document.querySelector(".panel-page-header-navigation-content")
    )
  ).toContain('"paddingRight":"102px"');
  tree.unmount();
  expect(state.resize).toBeUndefined();
  act(() => state.ticks.splice(0).forEach((fn) => fn()));
});
it("keeps nonfixed navigation in flow and web clear of the WeChat capsule", () => {
  state.env = "WEB";
  render(header(false));
  expect(document.querySelector(".panel-page-header-placeholder")).toBeNull();
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-status-bar"))
  ).toContain('"height":"0px"');
  expect(
    readTaroStyle(
      document.querySelector(".panel-page-header-navigation-content")
    )
  ).toContain('"paddingRight":"0px"');
});
it("leaves upstream profile headers and their styles unchanged", () => {
  render(
    <PageHeader variant="page" data-testid="profile" style="opacity:0.5">
      <PageHeader.Row data-testid="row" />
    </PageHeader>
  );
  expect(readTaroStyle(screen.getByTestId("profile"))).toBe(
    JSON.stringify("opacity:0.5")
  );
  expect(readTaroStyle(screen.getByTestId("row")) ?? "").not.toContain(
    "height"
  );
  expect(document.querySelector(".panel-page-header-placeholder")).toBeNull();
});
it("retains complete geometry during a transient invalid capsule measurement", () => {
  render(header());
  act(() => {
    state.menu = { top: 0, bottom: 0, left: 0, width: 0, height: 0 };
    state.ticks.splice(0).forEach((fn) => fn());
  });
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-placeholder"))
  ).toContain('"height":"87px"');
  act(() => {
    state.width = 430;
    state.resize?.();
  });
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-placeholder"))
  ).toContain('"height":"91px"');
});
