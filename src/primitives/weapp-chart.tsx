import { ECharts as NativeECharts } from "@amaster.ai/taro-echarts-ui";
import type { ComponentProps } from "react";

export type { EChartsOption } from "echarts";
export type WeappChartProps = ComponentProps<typeof NativeECharts>;
export const WeappChart = (props: WeappChartProps) => (
  <NativeECharts {...props} />
);
