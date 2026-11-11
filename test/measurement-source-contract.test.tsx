// @vitest-environment happy-dom

import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import { useElementLayout } from "../src/hooks/use-element-layout";
import {
  emitTestResize,
  setElementMeasurement,
  setDeepElementMeasurement,
  measurementStats,
  setTestMeasurement,
} from "./taro-api";

it("微信实测像素转换成上游点数，窗口变化重新测量", async () => {
  setTestMeasurement(40, 375);
  const { result, unmount } = renderHook(() => useElementLayout(true, "图标"));
  await waitFor(() => expect(result.current.layout?.width).toBe(40));
  setTestMeasurement(60, 750);
  act(() => emitTestResize());
  await waitFor(() => expect(result.current.layout?.width).toBe(30));
  unmount();
  expect(measurementStats().listeners).toBe(0);
});
it("没有插槽不测量，卸载后的异步调度不创建查询", async () => {
  const before = measurementStats().queries;
  const inactive = renderHook(() => useElementLayout(false, null));
  await act(async () => {
    await Promise.resolve();
  });
  expect(measurementStats().queries).toBe(before);
  inactive.unmount();
  const active = renderHook(() => useElementLayout(true, "内容"));
  active.unmount();
  await act(async () => {
    await Promise.resolve();
  });
  expect(measurementStats().queries).toBe(before);
});
it("deep recursive native components are measured across the theme ancestor boundary", async () => {
  setTestMeasurement(40, 375);
  setElementMeasurement("nested-native-layout", null);
  setDeepElementMeasurement("nested-native-layout", {
    height: 116,
    left: 12,
    top: 30,
    width: 240,
  });
  const hook = renderHook(() =>
    useElementLayout(true, "deep content", "nested-native-layout")
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(hook.result.current.layout).toEqual({
    height: 116,
    left: 12,
    top: 30,
    width: 240,
  });
});
