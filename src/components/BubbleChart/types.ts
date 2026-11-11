import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type BubbleChartStatus = "loading" | "ready";
export type BubbleChartDatum = Record<
  string,
  string | number | null | undefined
>;
export interface BubbleChartPoint {
  index: number;
  x: number;
  y: number;
  size: number | null;
  label: string;
  color: string;
  datum: BubbleChartDatum;
}
export interface ResolvedBubble extends BubbleChartPoint {
  r: number;
}
export interface BubbleChartProps
  extends ViewProps, ChartAccessibilityProps<BubbleChartDatum> {
  accessible?: boolean;
  onLayout?: (event: LineChartLayoutEvent) => void;
  className?: string;
  data: BubbleChartDatum[];
  xDataKey?: string;
  yDataKey?: string;
  sizeKey?: string;
  labelKey?: string;
  colorKey?: string;
  sizeRange?: [number, number];
  status?: BubbleChartStatus;
  aspectRatio?: number;
  animationDuration?: number;
  domainDuration?: number;
  xDomain?: [number, number];
  yDomain?: [number, number];
  onActivePointChange?: (point: BubbleChartPoint | null) => void;
  children?: ReactNode;
}
export interface BubbleChartHandle {
  replay: () => void;
}
export interface BubbleChartGridProps {
  rows?: number;
  columns?: number;
  dashArray?: string;
  color?: string;
  opacity?: number;
}
export interface BubbleChartTrendProps {
  onFit?: (fit: { slope: number; intercept: number; r: number }) => void;
  color?: string;
  strokeWidth?: number;
  dashArray?: string;
  opacity?: number;
}
export interface BubbleChartBubblesProps {
  opacity?: number;
  color?: string;
}
export interface BubbleChartSkeletonProps {
  count?: number;
  color?: string;
}
export interface BubbleChartLabelsProps {
  minRadius?: number;
  format?: (point: BubbleChartPoint) => string;
  className?: string;
}
export interface BubbleChartQuadrantsProps {
  x?: number;
  y?: number;
  labels?: {
    topLeft?: string;
    topRight?: string;
    bottomLeft?: string;
    bottomRight?: string;
  };
  tint?: boolean;
  color?: string;
  className?: string;
}
export interface BubbleChartSizeKeyProps {
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  format?: (value: number) => string;
  label?: string;
  className?: string;
}
export interface BubbleChartXAxisProps {
  ticks?: number;
  format?: (value: number) => string;
  label?: string;
  className?: string;
}
export interface BubbleChartYAxisProps {
  ticks?: number;
  format?: (value: number) => string;
  label?: string;
  className?: string;
}
export interface BubbleChartTooltipProps {
  showLabel?: boolean;
  formatX?: (value: number) => string;
  formatY?: (value: number) => string;
  formatSize?: (value: number) => string;
  hitRadius?: number;
  className?: string;
}
export interface BubbleChartLegendProps extends ViewProps {
  className?: string;
  limit?: number;
}
export interface BubbleChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  children?: ReactNode;
}
