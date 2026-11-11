import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ChartCurve } from "../../lib/chart";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type LiveLineChartStatus = "loading" | "ready";
export type LiveLineMomentum = "up" | "down" | "flat";
export interface LiveLineMomentumColors {
  up?: string;
  down?: string;
  flat?: string;
}
export interface LiveLinePoint {
  time: number;
  value: number;
}
export interface LiveLineChartProps extends ViewProps {
  onLayout?: (event: LineChartLayoutEvent) => void;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  data: LiveLinePoint[];
  window?: number;
  paused?: boolean;
  yDomain?: [number, number];
  domainDuration?: number;
  curve?: ChartCurve;
  maxPoints?: number;
  aspectRatio?: number;
  status?: LiveLineChartStatus;
  momentumColors?: LiveLineMomentumColors;
  color?: string;
  onActivePointChange?: (point: LiveLinePoint | null) => void;
  children?: ReactNode;
}
export interface LiveLineChartHandle {
  sync: () => void;
}
export interface LiveLineChartGridProps {
  rows?: number;
  color?: string;
  dashArray?: string;
}
export interface LiveLineChartLineProps {
  strokeWidth?: number;
  color?: string;
}
export interface LiveLineChartAreaProps {
  opacity?: number;
  color?: string;
}
export interface LiveLineChartTipProps {
  badge?: boolean;
  pulse?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}
export interface LiveLineChartXAxisProps {
  ticks?: number;
  formatTick?: (secondsAgo: number) => string;
  className?: string;
}
export interface LiveLineChartYAxisProps {
  ticks?: number;
  formatValue?: (value: number) => string;
  className?: string;
}
export interface LiveLineChartTooltipProps {
  formatValue?: (value: number) => string;
  className?: string;
}
export interface LiveLineChartSkeletonProps {
  color?: string;
}
export interface LiveLineChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  formatValue?: (value: number) => string;
  children?: ReactNode;
}
