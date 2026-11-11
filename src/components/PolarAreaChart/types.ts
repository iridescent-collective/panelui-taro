import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type PolarAreaChartStatus = "loading" | "ready";
export type PolarAreaScale = "radius" | "area";
export interface PolarAreaDatum {
  label: string;
  value: number;
  color?: string;
}
export interface PolarAreaChartProps extends ViewProps {
  onLayout?: (event: LineChartLayoutEvent) => void;
  className?: string;
  data: PolarAreaDatum[];
  size?: number;
  maxValue?: number;
  scale?: PolarAreaScale;
  startAngle?: number;
  padAngle?: number;
  status?: PolarAreaChartStatus;
  animationDuration?: number;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  children?: ReactNode;
}
export interface PolarAreaChartHandle {
  replay: () => void;
}
export interface PolarAreaChartWedgesProps {
  cornerRadius?: number;
  dimOpacity?: number;
}
export interface PolarAreaChartGridProps {
  rings?: number;
  color?: string;
  spokes?: boolean;
}
export interface PolarAreaChartLabelsProps {
  formatValue?: (value: number, datum: PolarAreaDatum) => string;
  minRadius?: number;
  className?: string;
}
export interface PolarAreaChartTooltipProps {
  formatValue?: (value: number, datum: PolarAreaDatum) => string;
  className?: string;
}
export interface PolarAreaChartLegendProps extends ViewProps {
  className?: string;
  showValue?: boolean;
  formatValue?: (value: number, datum: PolarAreaDatum) => string;
}
export interface PolarAreaChartSkeletonProps {
  color?: string;
}
export interface PolarAreaChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  labels?: Record<string, string>;
  legend?: boolean;
  children?: ReactNode;
}
