import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { SeriesColorIndex } from "../../lib/chart";
import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type PyramidChartStatus = "loading" | "ready";
export type PyramidChartSide = "start" | "end";
export type PyramidChartLabelPlacement = "above" | "center" | "start";
export type PyramidChartDatum = Record<
  string,
  string | number | null | undefined
>;
export interface PyramidChartProps
  extends ViewProps, ChartAccessibilityProps<PyramidChartDatum> {
  className?: string;
  data: PyramidChartDatum[];
  xDataKey?: string;
  status?: PyramidChartStatus;
  aspectRatio?: number;
  animationDuration?: number;
  domainDuration?: number;
  maxValue?: number;
  labelPlacement?: PyramidChartLabelPlacement;
  barGap?: number;
  barWidth?: number;
  cornerRadius?: number;
  minBarLength?: number;
  fadedOpacity?: number;
  onActiveIndexChange?: (
    index: number,
    datum: PyramidChartDatum | null
  ) => void;
  children?: ReactNode;
  accessible?: boolean;
  onLayout?: (event: LineChartLayoutEvent) => void;
}
export interface PyramidChartHandle {
  replay: () => void;
}
export interface PyramidChartGridProps {
  columns?: number;
  centreLine?: boolean;
  color?: string;
  dashArray?: string;
  opacity?: number;
}
export interface PyramidChartBarProps {
  dataKey: string;
  side?: PyramidChartSide;
  color?: string;
  colorIndex?: SeriesColorIndex;
  cornerRadius?: number;
}
export interface PyramidChartSkeletonProps {
  rows?: number;
  duration?: number;
  color?: string;
}
export interface PyramidChartXAxisProps {
  ticks?: number;
  format?: (value: number) => string;
  className?: string;
}
export interface PyramidChartYAxisProps {
  format?: (datum: PyramidChartDatum, index: number) => string;
  className?: string;
}
export interface PyramidChartTooltipProps {
  formatValue?: (value: number, key: string) => string;
  formatX?: (datum: PyramidChartDatum) => string;
  className?: string;
}
export interface PyramidChartLegendProps extends ViewProps {
  className?: string;
  labels?: Record<string, string>;
}
export interface PyramidChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  labels?: Record<string, string>;
  legend?: boolean;
  children?: ReactNode;
}
