// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Textarea } from "../src/components/Textarea";
import { setTestMeasurement } from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

it("row height composes with all five upstream font and padding metrics", () => {
  const heights = { lg: 100, md: 90, sm: 80, xl: 110, xs: 70 } as const;
  for (const [size, height] of Object.entries(heights)) {
    const { unmount } = render(
      <Textarea rows={3} size={size as keyof typeof heights} />
    );
    expect(readTaroStyle(screen.getByRole("textbox"))).toContain(
      `"height":"${height * 2}rpx"`
    );
    unmount();
  }
});
it("platform content-size events grow within rows and maxRows, then shrink back to the floor", () => {
  setTestMeasurement(100, 375);
  const size = vi.fn();
  render(<Textarea rows={2} maxRows={4} autoGrow onContentSizeChange={size} />);
  const field = screen.getByRole("textbox");
  act(() =>
    dispatchTaroEvent(field, TARO_TEST_EVENTS.lineChange, {
      height: 200,
      lineCount: 9,
    })
  );
  expect(readTaroStyle(field)).toContain('"height":"224rpx"');
  expect(size.mock.calls[0][0].nativeEvent.contentSize.height).toBe(200);
  act(() =>
    dispatchTaroEvent(field, TARO_TEST_EVENTS.lineChange, {
      height: 22,
      lineCount: 1,
    })
  );
  expect(readTaroStyle(field)).toContain('"height":"136rpx"');
});
it("counter updates from real input, colors the reached limit, and error replaces help", () => {
  render(
    <Textarea
      defaultValue="a"
      maxLength={3}
      showCount
      errorMessage="错误"
      description="提示"
    />
  );
  expect(screen.getByText("1/3")).toBeTruthy();
  fireEvent.input(screen.getByRole("textbox"), { target: { value: "abc" } });
  expect(screen.getByText("3/3").className).toContain("--panel-destructive");
  expect(screen.queryByText("提示")).toBeNull();
});
it("editable false is equivalent to disabled and never reports text changes", () => {
  const change = vi.fn();
  render(<Textarea editable={false} onChangeText={change} />);
  fireEvent.input(screen.getByRole("textbox"), { target: { value: "修改" } });
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole("textbox").getAttribute("aria-disabled")).toBe(
    "true"
  );
});
it("rows height includes padding and border instead of adding them outside the target", () => {
  render(<Textarea rows={2} />);
  expect(screen.getByRole("textbox").className).toContain("box-border");
});

it("sizes auto-grown rows from lineCount rather than a platform height that already includes padding", () => {
  render(<Textarea rows={1} maxRows={3} autoGrow />);
  const field = screen.getByRole("textbox");
  act(() =>
    dispatchTaroEvent(field, TARO_TEST_EVENTS.lineChange, {
      height: 46,
      lineCount: 1,
    })
  );
  expect(readTaroStyle(field)).toContain('"height":"92rpx"');
  act(() =>
    dispatchTaroEvent(field, TARO_TEST_EVENTS.lineChange, {
      height: 1,
      lineCount: 5,
    })
  );
  expect(readTaroStyle(field)).toContain('"height":"180rpx"');
  act(() =>
    dispatchTaroEvent(field, TARO_TEST_EVENTS.lineChange, {
      height: 2000,
      lineCount: 1,
    })
  );
  expect(readTaroStyle(field)).toContain('"height":"92rpx"');
});
