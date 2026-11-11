import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { SeriesColorIndex } from "../../lib/chart";
import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type BarChartStatus = "loading" | "ready";
export type BarChartOrientation = "vertical" | "horizontal";
export type BarChartDatum = Record<string, string | number | null | undefined>;
export interface BarChartProps
  extends ViewProps, ChartAccessibilityProps<BarChartDatum> {
  className?: string;
  data: BarChartDatum[];
  xDataKey?: string;
  status?: BarChartStatus;
  aspectRatio?: number;
  animationDuration?: number;
  domainDuration?: number;
  yDomain?: [number, number];
  orientation?: BarChartOrientation;
  stacked?: boolean;
  barGap?: number;
  barWidth?: number;
  stackGap?: number;
  cornerRadius?: number;
  minBarLength?: number;
  fadedOpacity?: number;
  onActiveIndexChange?: (index: number, datum: BarChartDatum | null) => void;
  compact?: boolean;
  children?: ReactNode;
  accessible?: boolean;
  onLayout?: (event: LineChartLayoutEvent) => void;
}
export interface BarChartHandle {
  replay: () => void;
}
export interface BarChartGridProps {
  rows?: number;
  color?: string;
  dashArray?: string;
  opacity?: number;
}
export interface BarChartBarProps {
  dataKey: string;
  color?: string;
  colorIndex?: SeriesColorIndex;
  cornerRadius?: number;
}
export interface BarChartSkeletonProps {
  bars?: number;
  duration?: number;
  color?: string;
}
export interface BarChartXAxisProps {
  ticks?: number;
  format?: (datum: BarChartDatum, index: number) => string;
  className?: string;
}
export interface BarChartYAxisProps {
  ticks?: number;
  format?: (value: number) => string;
  className?: string;
}
export interface BarChartTooltipProps {
  formatValue?: (value: number, key: string) => string;
  formatX?: (datum: BarChartDatum) => string;
  className?: string;
}
export interface BarChartLegendProps extends ViewProps {
  className?: string;
  labels?: Record<string, string>;
}
export interface BarChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  labels?: Record<string, string>;
  legend?: boolean;
  children?: ReactNode;
}
