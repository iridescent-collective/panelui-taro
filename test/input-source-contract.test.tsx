// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { Input } from "../src/components/Input";
import type { InputHandle } from "../src/components/Input";
import { setTestMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

it("source onChangeText and native input events report the same value", () => {
  const changed = vi.fn();
  const input = vi.fn();
  render(
    <Input
      defaultValue="初始"
      onChangeText={changed}
      onInput={input}
      label="姓名"
    />
  );
  const field = screen.getByRole("textbox");
  fireEvent.input(field, { target: { value: "小栗" } });
  expect(changed).toHaveBeenCalledWith("小栗");
  expect(input.mock.calls[0][0].detail.value).toBe("小栗");
  expect((field as HTMLInputElement).value).toBe("小栗");
});
it("required and invalid labels render error in preference to help and disabled blocks input", () => {
  const change = vi.fn();
  render(
    <Input
      label="姓名"
      isRequired
      description="提示"
      errorMessage="必填"
      disabled
      value="原值"
      onChangeText={change}
    />
  );
  expect(screen.getByText("*")).toBeTruthy();
  expect(screen.getByText("必填")).toBeTruthy();
  expect(screen.queryByText("提示")).toBeNull();
  expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe("true");
  fireEvent.input(screen.getByRole("textbox"), { target: { value: "修改" } });
  expect(change).not.toHaveBeenCalled();
});
it("focus and blur update source imperative focus state and field tint", () => {
  const ref = createRef<InputHandle>();
  const onFocus = vi.fn();
  render(<Input ref={ref} onFocus={onFocus} />);
  expect(ref.current?.isFocused()).toBe(false);
  fireEvent.focus(screen.getByRole("textbox"));
  expect(ref.current?.isFocused()).toBe(true);
  expect(onFocus).toHaveBeenCalledTimes(1);
  fireEvent.blur(screen.getByRole("textbox"));
  expect(ref.current?.isFocused()).toBe(false);
  act(() => ref.current?.clear());
});
it("actual content measurements preserve input clearance and caller styles win", async () => {
  setTestMeasurement(52, 375);
  const { rerender } = render(<Input startContent="单位" />);
  await waitFor(() =>
    expect(readTaroStyle(screen.getByRole("textbox"))).toContain("104rpx")
  );
  rerender(<Input startContent="单位" style={{ paddingLeft: "120rpx" }} />);
  expect(readTaroStyle(screen.getByRole("textbox"))).toContain("120rpx");
});
it("multiline uses platform textarea with source sizing and disables automatic page lift by default", () => {
  render(<Input multiline defaultValue="第一行" />);
  expect(screen.getByRole("textbox").tagName).toBe("TEXTAREA");
  expect(screen.getByRole("textbox").className).toContain("min-h-[192px]");
});
it("原生 focus 回调同步焦点标志，使 imperative blur 能改变平台属性", () => {
  const ref = createRef<InputHandle>();
  render(<Input ref={ref} />);
  fireEvent.focus(screen.getByRole("textbox"));
  expect(screen.getByRole("textbox").dataset.taroFocus).toBe("true");
  act(() => ref.current?.blur());
  expect(screen.getByRole("textbox").dataset.taroFocus).toBe("false");
});
it("native input replacement is retained by the uncontrolled field", () => {
  render(<Input onInput={() => "替换值"} />);
  fireEvent.input(screen.getByRole("textbox"), { target: { value: "原值" } });
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
    "替换值"
  );
});
it("controlled field reports requested text while retaining the accepted parent value", () => {
  const change = vi.fn();
  render(<Input value="接受值" onChangeText={change} />);
  fireEvent.input(screen.getByRole("textbox"), { target: { value: "请求值" } });
  expect(change).toHaveBeenCalledWith("请求值");
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
    "接受值"
  );
});
it("native fields preserve Yoga's border-box dimensions instead of expanding with padding", () => {
  render(<Input startContent="图标" />);
  expect(screen.getByRole("textbox").className).toContain("box-border");
});

it("visuallyHidden owns native editor visibility while preserving focus and input", () => {
  const changed = vi.fn();
  const handle = createRef<InputHandle>();
  render(
    <Input
      ref={handle}
      visuallyHidden
      accessibilityLabel="Custom code editor"
      onChangeText={changed}
      style={{ color: "red", left: 0, opacity: 1, width: "100%" }}
    />
  );
  const field = screen.getByLabelText("Custom code editor") as HTMLInputElement;
  expect(field.style.color).toBe("transparent");
  expect(field.style.caretColor).toBe("transparent");
  expect(field.style.width).toBe("1px");
  expect(field.style.height).toBe("1px");
  expect(field.style.left).toBe("-10000px");
  expect(field.hasAttribute("visuallyHidden")).toBe(false);
  act(() => handle.current?.focus());
  expect(field.dataset.taroFocus).toBe("true");
  fireEvent.focus(field);
  expect(handle.current?.isFocused()).toBe(true);
  fireEvent.input(field, { target: { value: "161511" } });
  expect(changed).toHaveBeenCalledWith("161511");
});
