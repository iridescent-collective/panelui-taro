// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Message } from "../src/components/Message";
import { useIconColor } from "../src/icons/context";
import { setTheme } from "../src/theme/store";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

const IconProbe = () => <span>{useIconColor()}</span>;
it("outgoing bubbles publish the source foreground to nested icons and content", () => {
  setTheme("light");
  render(
    <Message align="end">
      <Message.Content>
        <Message.Bubble>
          <Message.BubbleContent>已发送</Message.BubbleContent>
          <IconProbe />
        </Message.Bubble>
      </Message.Content>
    </Message>
  );
  expect(screen.getByText("#fafafa")).toBeTruthy();
  expect(screen.getByText("已发送").className).toContain(
    "text-[color:var(--panel-primary-foreground)]"
  );
  expect(screen.getByText("已发送").parentElement?.className).toContain(
    "rounded-ee-[var(--panel-radius-md)]"
  );
});

it("group defaults keep continuation avatar geometry while excluding hidden copies from accessibility", () => {
  render(
    <Message.Group align="end">
      <Message>
        <Message.Avatar>
          <span role="img" aria-label="家长头像" />
        </Message.Avatar>
        <Message.Content>第一条</Message.Content>
      </Message>
      <Message>
        <Message.Avatar>
          <span role="img" aria-label="家长头像" />
        </Message.Avatar>
        <Message.Content>第二条</Message.Content>
      </Message>
      <Message stacked={false} align="start">
        <Message.Avatar>
          <span role="img" aria-label="设备头像" />
        </Message.Avatar>
        <Message.Content>显式覆盖</Message.Content>
      </Message>
    </Message.Group>
  );
  expect(screen.getAllByRole("img", { name: "家长头像" })).toHaveLength(1);
  expect(
    screen.getAllByRole("img", { hidden: true, name: "家长头像" })
  ).toHaveLength(2);
  expect(screen.getByText("第一条").parentElement?.className).toContain(
    "items-end"
  );
  expect(screen.getByText("显式覆盖").parentElement?.className).toContain(
    "items-start"
  );
});

it("message long press emits the platform event without creating an unrelated button role", () => {
  const press = vi.fn();
  const { container } = render(<Message onLongPress={press}>操作消息</Message>);
  const root = container.firstElementChild;
  if (!root) {
    throw new Error("Message root missing");
  }
  const event = { changedTouches: [], touches: [] };
  dispatchTaroEvent(root, TARO_TEST_EVENTS.longPress, event);
  expect(press).toHaveBeenCalledWith(event);
  expect(screen.queryByRole("button")).toBeNull();
});
