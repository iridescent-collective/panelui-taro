// @vitest-environment happy-dom

import { render } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { WeappChart } from "../src/primitives/weapp-chart";
import type { WeappChartProps } from "../src/primitives/weapp-chart";

const renderer = vi.hoisted(() => ({
  render: vi.fn((_props: Record<string, unknown>) => null),
}));
vi.mock("@amaster.ai/taro-echarts-ui", () => ({ ECharts: renderer.render }));

it("forwards the existing chart configuration, dimensions and styles without replacing the graph engine", () => {
  const option: WeappChartProps["option"] = {
    animation: false,
    series: [{ data: [], type: "graph" }],
  };
  const style = { height: "440rpx" };
  render(
    <WeappChart
      option={option}
      width="100%"
      height="100%"
      style={style}
      defaultHeight="300px"
    />
  );
  const props = renderer.render.mock.calls[0]?.[0];
  expect(props.option).toBe(option);
  expect(props.width).toBe("100%");
  expect(props.height).toBe("100%");
  expect(props.style).toBe(style);
  expect(props.defaultHeight).toBe("300px");
});
