// @vitest-environment happy-dom
import { render, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";

import {
  ChartAxisText,
  useAxisLabelScale,
} from "../src/primitives/chart-axis-text";
import { getSystemInfoSync, getWindowInfo } from "./taro-api";
import { readTaroStyle } from "./taro-style";
it("caps axis text at 1.353 while widening heatmap gutters only above default", () => {
  getSystemInfoSync.mockReturnValueOnce({
    ...getWindowInfo(),
    fontSizeSetting: 40,
  });
  const { container } = render(<ChartAxisText>Axis</ChartAxisText>);
  expect(readTaroStyle(container.firstElementChild)).toContain("32.472rpx");
  getSystemInfoSync.mockReturnValueOnce({
    ...getWindowInfo(),
    fontSizeSetting: 8,
  });
  expect(renderHook(() => useAxisLabelScale()).result.current).toBe(1);
});
