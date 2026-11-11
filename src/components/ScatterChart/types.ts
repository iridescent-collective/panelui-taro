import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type ScatterChartStatus = "loading" | "ready";
export type ScatterChartDatum = Record<
  string,
  string | number | null | undefined
>;
export interface ScatterChartPoint {
  index: number;
  dataKey: string;
  x: number;
  y: number;
  datum: ScatterChartDatum;
}
export interface ScatterChartProps
  extends ViewProps, ChartAccessibilityProps<ScatterChartDatum> {
  accessible?: boolean;
  onLayout?: (event: LineChartLayoutEvent) => void;
  className?: string;
  data: ScatterChartDatum[];
  xDataKey?: string;
  status?: ScatterChartStatus;
  aspectRatio?: number;
  animationDuration?: number;
  domainDuration?: number;
  xDomain?: [number, number];
  yDomain?: [number, number];
  onActivePointChange?: (point: ScatterChartPoint | null) => void;
  compact?: boolean;
  children?: ReactNode;
}
export interface ScatterChartHandle {
  replay: () => void;
}
export interface ScatterChartGridProps {
  rows?: number;
  columns?: number;
  color?: string;
  dashArray?: string;
  opacity?: number;
}
export interface ScatterChartPointsProps {
  dataKey: string;
  color?: string;
  colorIndex?: 1 | 2 | 3 | 4 | 5;
  size?: number;
  sizeKey?: string;
  sizeRange?: [number, number];
  opacity?: number;
}
export interface ScatterChartSkeletonProps {
  count?: number;
  color?: string;
}
export interface ScatterChartXAxisProps {
  ticks?: number;
  format?: (value: number) => string;
  className?: string;
}
export interface ScatterChartYAxisProps {
  ticks?: number;
  format?: (value: number) => string;
  className?: string;
}
export interface ScatterChartTooltipProps {
  showLabel?: boolean;
  formatX?: (value: number) => string;
  formatY?: (value: number, key: string) => string;
  formatTitle?: (datum: ScatterChartDatum) => string;
  hitRadius?: number;
}
export interface ScatterChartLegendProps extends ViewProps {
  className?: string;
  labels?: Record<string, string>;
}
export interface ScatterChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  labels?: Record<string, string>;
  legend?: boolean;
  children?: ReactNode;
}
