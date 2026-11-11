// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Steps } from "../src/components/Steps";

it("automatic connectors stop at the final item and position differs from author numbering", () => {
  render(
    <PanelUIProvider>
      <Steps defaultValue={10}>
        <Steps.Item step={10}>
          <Steps.Trigger accessibilityLabel="开始">
            <Steps.Indicator />
            <Steps.Title>开始</Steps.Title>
          </Steps.Trigger>
        </Steps.Item>
        <Steps.Item step={20}>
          <Steps.Trigger accessibilityLabel="完成">
            <Steps.Indicator />
            <Steps.Title>完成</Steps.Title>
          </Steps.Trigger>
        </Steps.Item>
      </Steps>
    </PanelUIProvider>
  );
  expect(
    screen.getByRole("button", { name: "开始" }).getAttribute("aria-valuetext")
  ).toBe("step 1 of 2, current step");
});
it("direct source items receive a connector once and hand-placed separators are retained", () => {
  const { container } = render(
    <PanelUIProvider>
      <Steps>
        <Steps.Item step={0} id="item-first">
          <Steps.Trigger>第一步</Steps.Trigger>
          <Steps.Separator id="custom-line" />
        </Steps.Item>
        <Steps.Item step={1} id="item-second">
          <Steps.Trigger>第二步</Steps.Trigger>
        </Steps.Item>
        <Steps.Item step={2} id="item-last">
          <Steps.Trigger>第三步</Steps.Trigger>
        </Steps.Item>
      </Steps>
    </PanelUIProvider>
  );
  expect(
    container.querySelectorAll('#item-first > [aria-hidden="true"]')
  ).toHaveLength(1);
  expect(
    container.querySelectorAll('#item-second > [aria-hidden="true"]')
  ).toHaveLength(1);
  expect(
    container.querySelectorAll('#item-last > [aria-hidden="true"]')
  ).toHaveLength(0);
  fireEvent.click(screen.getByText("第二步"));
  expect(
    screen
      .getByRole("button", { name: "第一步" })
      .getAttribute("aria-valuetext")
  ).toContain("completed");
  expect(
    screen
      .getByRole("button", { name: "第二步" })
      .getAttribute("aria-valuetext")
  ).toContain("current step");
});
it("item disabled wins over a false trigger override and suppresses all callbacks", () => {
  const press = vi.fn();
  const change = vi.fn();
  render(
    <PanelUIProvider>
      <Steps onValueChange={change}>
        <Steps.Item step={1} disabled>
          <Steps.Trigger disabled={false} onPress={press}>
            禁止切换
          </Steps.Trigger>
        </Steps.Item>
      </Steps>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByText("禁止切换"));
  expect(press).not.toHaveBeenCalled();
  expect(change).not.toHaveBeenCalled();
  expect(
    screen
      .getByRole("button", { name: "禁止切换" })
      .getAttribute("aria-disabled")
  ).toBe("true");
});
it("controlled steps emit the request without inventing a new active state", () => {
  const change = vi.fn();
  render(
    <PanelUIProvider>
      <Steps value={0} onValueChange={change}>
        <Steps.Item step={1}>
          <Steps.Trigger>下一步</Steps.Trigger>
        </Steps.Item>
      </Steps>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByText("下一步"));
  expect(change).toHaveBeenCalledWith(1);
  expect(
    screen.getByRole("button", { name: "下一步" }).getAttribute("aria-selected")
  ).toBe("false");
});
it("native Taro click handlers do not bypass the step selection", () => {
  const click = vi.fn();
  const change = vi.fn();
  render(
    <PanelUIProvider>
      <Steps onValueChange={change}>
        <Steps.Item step={2}>
          <Steps.Trigger onClick={click}>原生点击</Steps.Trigger>
        </Steps.Item>
      </Steps>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByText("原生点击"));
  expect(click).toHaveBeenCalledTimes(1);
  expect(change).toHaveBeenCalledWith(2);
});

it("loading belongs to the active step, custom indicators survive, and automatic separators can be disabled", () => {
  const { container } = render(
    <PanelUIProvider>
      <Steps value={1} separators={false}>
        <Steps.Item step={0} id="loading-old" loading>
          <Steps.Trigger accessibilityLabel="已完成">
            <Steps.Indicator />
          </Steps.Trigger>
        </Steps.Item>
        <Steps.Item step={1} id="loading-current" loading>
          <Steps.Trigger accessibilityLabel="处理中">
            <Steps.Indicator>自定义图形</Steps.Indicator>
          </Steps.Trigger>
        </Steps.Item>
        <Steps.Item step={2} id="loading-future" loading>
          <Steps.Trigger accessibilityLabel="待开始">
            <Steps.Indicator />
          </Steps.Trigger>
        </Steps.Item>
      </Steps>
    </PanelUIProvider>
  );
  expect(
    screen
      .getByRole("button", { name: "已完成" })
      .getAttribute("aria-valuetext")
  ).toContain("completed");
  expect(
    screen
      .getByRole("button", { name: "处理中" })
      .getAttribute("aria-valuetext")
  ).toContain("in progress");
  expect(
    screen
      .getByRole("button", { name: "待开始" })
      .getAttribute("aria-valuetext")
  ).toContain("not started");
  expect(screen.getByText("自定义图形")).toBeTruthy();
  expect(
    container.querySelectorAll('#loading-current > [aria-hidden="true"]')
  ).toHaveLength(0);
});
