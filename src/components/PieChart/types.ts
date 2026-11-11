import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type PieChartStatus = "loading" | "ready";
export interface PieDatum {
  label: string;
  value: number;
  color?: string;
}
export interface PieChartProps extends ViewProps {
  className?: string;
  data: PieDatum[];
  size?: number;
  innerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  padAngle?: number;
  minAngle?: number;
  animationDuration?: number;
  status?: PieChartStatus;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  children?: ReactNode;
  onLayout?: (event: LineChartLayoutEvent) => void;
}
export interface PieChartHandle {
  replay: () => void;
}
export interface PieChartSlicesProps {
  cornerRadius?: number;
  popOut?: number;
  dimOpacity?: number;
}
export interface PieChartSkeletonProps {
  color?: string;
}
export interface PieChartCenterProps {
  defaultLabel?: string;
  formatValue?: (value: number, slice: PieDatum | null) => string;
  children?: (slice: PieDatum | null) => ReactNode;
  className?: string;
}
export interface PieChartLegendProps extends ViewProps {
  className?: string;
  showValue?: boolean;
}
export interface PieChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  labels?: Record<string, string>;
  legend?: boolean;
  children?: ReactNode;
}
