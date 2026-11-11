// @vitest-environment happy-dom

import { View } from "@tarojs/components";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Tooltip } from "../src/components/Tooltip";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

it("long press preserves the child handler, mirrors the label, and does not steal a normal press", async () => {
  const press = vi.fn();
  const long = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Tooltip label="复制链接" duration={0}>
        <Tooltip.Trigger>
          <View role="button" onClick={press} onLongPress={long}>
            操作
          </View>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Arrow />
          复制链接
        </Tooltip.Content>
      </Tooltip>
    </PanelUIProvider>
  );
  const trigger = screen.getByRole("button", { name: "复制链接" });
  fireEvent.click(trigger);
  expect(press).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("tooltip")).toBeNull();
  act(() => dispatchTaroEvent(trigger, TARO_TEST_EVENTS.longPress, {}));
  await waitFor(() => expect(screen.getByRole("tooltip")).toBeTruthy());
  expect(long).toHaveBeenCalledTimes(1);
  expect(screen.getByText("复制链接")).toBeTruthy();
});
it("press mode toggles, dismisses outside and publishes surface colours to every text part", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <Tooltip openOn="press" duration={0}>
        <Tooltip.Trigger>
          <View role="button">打开</View>
        </Tooltip.Trigger>
        <Tooltip.Content variant="surface">
          <Tooltip.Title>标题</Tooltip.Title>
          <Tooltip.Description>说明</Tooltip.Description>
          <Tooltip.Text>正文</Tooltip.Text>
        </Tooltip.Content>
      </Tooltip>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "打开" }));
  await waitFor(() => expect(screen.getByRole("tooltip")).toBeTruthy());
  expect(screen.getByRole("heading", { name: "标题" }).className).toContain(
    "var(--panel-popover-foreground)"
  );
  expect(screen.getByText("说明").className).toContain(
    "var(--panel-muted-foreground)"
  );
  fireEvent.click(screen.getByLabelText("Dismiss"));
  await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
});
it("default open measures its trigger and leaves the surrounding content accessible", async () => {
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <Tooltip defaultOpen duration={0}>
        <Tooltip.Trigger>
          <View role="button">初始控件</View>
        </Tooltip.Trigger>
        <Tooltip.Content minWidth={100}>默认提示</Tooltip.Content>
      </Tooltip>
    </PanelUIProvider>
  );
  await waitFor(() => expect(screen.getByRole("tooltip")).toBeTruthy());
  expect(
    container
      .querySelector('[data-panelui-content="true"]')
      ?.getAttribute("aria-hidden")
  ).toBe("false");
});
it("controlled refusal emits the request without inventing an open tooltip", async () => {
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Tooltip open={false} onOpenChange={change} openOn="press">
        <Tooltip.Trigger>
          <View role="button">受控控件</View>
        </Tooltip.Trigger>
        <Tooltip.Content>受控提示</Tooltip.Content>
      </Tooltip>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "受控控件" }));
  await waitFor(() => expect(change).toHaveBeenCalledWith(true));
  expect(screen.queryByRole("tooltip")).toBeNull();
});
it("auto hide uses the source duration and releases its timer on unmount", async () => {
  vi.useFakeTimers();
  try {
    const change = vi.fn();
    const tree = render(
      <PanelUIProvider reducedMotion>
        <Tooltip defaultOpen duration={1500} onOpenChange={change}>
          <Tooltip.Trigger>
            <View role="button">定时控件</View>
          </Tooltip.Trigger>
          <Tooltip.Content>定时提示</Tooltip.Content>
        </Tooltip>
      </PanelUIProvider>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1499);
    });
    expect(change).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(change).toHaveBeenCalledWith(false);
    tree.unmount();
    const count = change.mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(change).toHaveBeenCalledTimes(count);
  } finally {
    vi.useRealTimers();
  }
});
