// @vitest-environment happy-dom
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { beforeEach, expect, it, vi } from "vitest";

import { PageHeader } from "../src/components/PageHeader";
import { setElementMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";
const device = vi.hoisted(() => ({ width: 375 }));
beforeEach(() => {
  device.width = 375;
});
vi.mock("@tarojs/taro", async (original) => ({
  ...(await original<object>()),
  getWindowInfo: () => ({ windowWidth: device.width, statusBarHeight: 20 }),
  getMenuButtonBoundingClientRect: () => ({
    top: 24,
    bottom: 56,
    left: 278,
    width: 87,
    height: 32,
  }),
}));
const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
it("measures the complete header for its placeholder without replacing upstream card styles", async () => {
  setElementMeasurement("full-header", {
    top: 0,
    left: 0,
    width: 375,
    height: 136,
  });
  render(
    <PageHeader
      id="full-header"
      data-testid="header"
      navigation
      style={{ opacity: 0.5 }}
    >
      <PageHeader.Row data-testid="row">
        <PageHeader.Title>Title</PageHeader.Title>
      </PageHeader.Row>
      <PageHeader.Description>Details</PageHeader.Description>
    </PageHeader>
  );
  await flush();
  const header = screen.getByTestId("header"),
    row = screen.getByTestId("row");
  expect(header.className).toContain("panel-card");
  expect(header.className).toContain("panel-radius-3xl");
  expect(header.className).toContain("p-[16px]");
  expect(readTaroStyle(header)).not.toContain('"height":');
  expect(readTaroStyle(header)).not.toContain('"paddingTop":');
  expect(readTaroStyle(header)).toContain('"opacity":0.5');
  expect(row.className).toContain("gap-[40px]");
  expect(row.className).toContain("px-[24px]");
  expect(readTaroStyle(row)).not.toContain('"height":');
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-placeholder"))
  ).toContain('"height":"272rpx"');
});
it("remeasures changing content instead of clipping it to a navigation row", async () => {
  setElementMeasurement("growing-header", {
    top: 0,
    left: 0,
    width: 375,
    height: 80,
  });
  const tree = render(
    <PageHeader navigation id="growing-header">
      <PageHeader.Row>
        <PageHeader.Title>Title</PageHeader.Title>
      </PageHeader.Row>
    </PageHeader>
  );
  await flush();
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-placeholder"))
  ).toContain('"height":"160rpx"');
  setElementMeasurement("growing-header", {
    top: 0,
    left: 0,
    width: 375,
    height: 180,
  });
  tree.rerender(
    <PageHeader navigation id="growing-header">
      <PageHeader.Row>
        <PageHeader.Title>Title</PageHeader.Title>
      </PageHeader.Row>
      <PageHeader.Actions>More actions</PageHeader.Actions>
    </PageHeader>
  );
  await flush();
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-placeholder"))
  ).toContain('"height":"360rpx"');
});
it("allows explicitly disabling placeholder and top safe area without losing capsule clearance", async () => {
  render(
    <PageHeader
      navigation
      placeholder={false}
      safeAreaInsetTop={false}
      data-testid="header"
    >
      <PageHeader.Row>
        <PageHeader.Title>Title</PageHeader.Title>
      </PageHeader.Row>
    </PageHeader>
  );
  await flush();
  expect(document.querySelector(".panel-page-header-placeholder")).toBeNull();
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-status-bar"))
  ).toContain('"height":"0px"');
  expect(
    readTaroStyle(
      document.querySelector(".panel-page-header-navigation-content")
    )
  ).toContain('"paddingRight":"105px"');
});

it("remeasures child-local style changes without rerendering PageHeader", async () => {
  const ExpandingContent = () => {
    const [expanded, setExpanded] = useState(false);
    return (
      <div style={{ height: expanded ? "160px" : "60px" }}>
        <button onClick={() => setExpanded((value) => !value)}>
          Toggle height
        </button>
      </div>
    );
  };
  setElementMeasurement("local-height-header", {
    top: 0,
    left: 0,
    width: 375,
    height: 60,
  });
  render(
    <PageHeader navigation id="local-height-header">
      <ExpandingContent />
    </PageHeader>
  );
  await flush();
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-placeholder"))
  ).toContain('"height":"120rpx"');
  setElementMeasurement("local-height-header", {
    top: 0,
    left: 0,
    width: 375,
    height: 160,
  });
  fireEvent.click(screen.getByRole("button", { name: "Toggle height" }));
  await waitFor(() =>
    expect(
      readTaroStyle(document.querySelector(".panel-page-header-placeholder"))
    ).toContain('"height":"320rpx"')
  );
});

it("preserves physical placeholder height on a non-375-wide device", async () => {
  device.width = 390;
  setElementMeasurement("wide-header", {
    top: 0,
    left: 0,
    width: 390,
    height: 104,
  });
  render(
    <PageHeader navigation id="wide-header">
      <PageHeader.Row>
        <PageHeader.Title>Title</PageHeader.Title>
      </PageHeader.Row>
    </PageHeader>
  );
  await flush();
  // 200rpx at a 390px window is exactly the measured 104 physical pixels.
  expect(
    readTaroStyle(document.querySelector(".panel-page-header-placeholder"))
  ).toContain('"height":"200rpx"');
});
