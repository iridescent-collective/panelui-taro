import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { SeriesColorIndex } from "../../lib/chart";
import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";

export type LineChartStatus = "loading" | "ready";
export type LineChartCurve = "monotone" | "linear";
export type LineChartDatum = Record<string, string | number | null | undefined>;
export interface LineChartLayoutEvent {
  nativeEvent: {
    layout: { width: number; height: number; x: number; y: number };
  };
}
export interface LineChartProps
  extends ComponentProps<typeof View>, ChartAccessibilityProps<LineChartDatum> {
  data: LineChartDatum[];
  xDataKey?: string;
  status?: LineChartStatus;
  aspectRatio?: number;
  animationDuration?: number;
  domainDuration?: number;
  yDomain?: [number, number];
  curve?: LineChartCurve;
  onActiveIndexChange?: (index: number, datum: LineChartDatum | null) => void;
  compact?: boolean;
  accessible?: boolean;
  children?: ReactNode;
  onLayout?: (event: LineChartLayoutEvent) => void;
}
export interface LineChartHandle {
  replay: () => void;
}
export interface LineChartGridProps {
  rows?: number;
  color?: string;
  dashArray?: string;
  opacity?: number;
}
export interface LineChartLineProps {
  dataKey: string;
  color?: string;
  colorIndex?: SeriesColorIndex;
  strokeWidth?: number;
  dashArray?: string;
  showMarkers?: boolean;
}
export interface LineChartAreaProps {
  dataKey: string;
  color?: string;
  colorIndex?: SeriesColorIndex;
  opacity?: number;
}
export interface LineChartSkeletonProps {
  duration?: number;
  color?: string;
}
export interface LineChartXAxisProps {
  ticks?: number;
  format?: (datum: LineChartDatum, index: number) => string;
  className?: string;
}
export interface LineChartYAxisProps {
  ticks?: number;
  format?: (value: number) => string;
  className?: string;
}
export interface LineChartTooltipProps {
  color?: string;
  showLabel?: boolean;
  formatValue?: (value: number, key: string) => string;
  formatX?: (datum: LineChartDatum) => string;
}
export interface LineChartLegendProps extends ComponentProps<typeof View> {
  labels?: Record<string, string>;
}
export interface LineChartHeaderProps extends ComponentProps<typeof View> {
  title?: string;
  value?: string;
  caption?: string;
  labels?: Record<string, string>;
  legend?: boolean;
  children?: ReactNode;
}
