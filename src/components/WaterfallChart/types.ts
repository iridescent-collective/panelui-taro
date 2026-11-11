import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type WaterfallChartStatus = "loading" | "ready";
export type WaterfallChartOrientation = "vertical" | "horizontal";
export type WaterfallKind = "rise" | "fall" | "total";
export interface WaterfallDatum {
  label: string;
  value: number;
  total?: boolean;
  color?: string;
}
export interface WaterfallStep {
  datum: WaterfallDatum;
  label: string;
  value: number;
  kind: WaterfallKind;
  start: number;
  end: number;
}
export interface WaterfallChartProps
  extends ViewProps, ChartAccessibilityProps<WaterfallStep> {
  className?: string;
  data: WaterfallDatum[];
  status?: WaterfallChartStatus;
  aspectRatio?: number;
  animationDuration?: number;
  domainDuration?: number;
  yDomain?: [number, number];
  orientation?: WaterfallChartOrientation;
  barGap?: number;
  barWidth?: number;
  cornerRadius?: number;
  minBarLength?: number;
  fadedOpacity?: number;
  riseColor?: string;
  fallColor?: string;
  totalColor?: string;
  onActiveIndexChange?: (index: number, step: WaterfallStep | null) => void;
  compact?: boolean;
  children?: ReactNode;
  accessible?: boolean;
  onLayout?: (event: LineChartLayoutEvent) => void;
}
export interface WaterfallChartHandle {
  replay: () => void;
}
export interface WaterfallChartGridProps {
  rows?: number;
  color?: string;
  dashArray?: string;
  opacity?: number;
}
export interface WaterfallChartBarsProps {
  cornerRadius?: number;
}
export interface WaterfallChartConnectorsProps {
  color?: string;
  dashArray?: string;
  strokeWidth?: number;
  opacity?: number;
}
export interface WaterfallChartValuesProps {
  format?: (step: WaterfallStep, index: number) => string;
  className?: string;
}
export interface WaterfallChartSkeletonProps {
  bars?: number;
  duration?: number;
  color?: string;
}
export interface WaterfallChartXAxisProps {
  ticks?: number;
  format?: (step: WaterfallStep, index: number) => string;
  className?: string;
}
export interface WaterfallChartYAxisProps {
  ticks?: number;
  format?: (value: number) => string;
  className?: string;
}
export interface WaterfallChartTooltipProps {
  formatValue?: (step: WaterfallStep) => string;
  formatTotal?: (step: WaterfallStep) => string | null;
  className?: string;
}
export interface WaterfallChartLegendProps extends ViewProps {
  className?: string;
  labels?: Partial<Record<WaterfallKind, string>>;
}
export interface WaterfallChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  labels?: Partial<Record<WaterfallKind, string>>;
  legend?: boolean;
  children?: ReactNode;
}
