import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ChartCurve, SeriesColorIndex } from "../../lib/chart";
import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type AreaChartStatus = "loading" | "ready";
export type AreaChartDatum = Record<string, string | number | null | undefined>;
export interface AreaChartProps
  extends ViewProps, ChartAccessibilityProps<AreaChartDatum> {
  className?: string;
  data: AreaChartDatum[];
  xDataKey?: string;
  status?: AreaChartStatus;
  aspectRatio?: number;
  animationDuration?: number;
  domainDuration?: number;
  yDomain?: [number, number];
  stacked?: boolean;
  curve?: ChartCurve;
  onActiveIndexChange?: (index: number, datum: AreaChartDatum | null) => void;
  compact?: boolean;
  children?: ReactNode;
  accessible?: boolean;
  onLayout?: (event: LineChartLayoutEvent) => void;
}
export interface AreaChartHandle {
  replay: () => void;
}
export interface AreaChartGridProps {
  rows?: number;
  color?: string;
  dashArray?: string;
  opacity?: number;
}
export interface AreaChartAreaProps {
  dataKey: string;
  color?: string;
  colorIndex?: SeriesColorIndex;
  fillOpacity?: number;
  gradientToOpacity?: number;
  showLine?: boolean;
  strokeWidth?: number;
}
export interface AreaChartSkeletonProps {
  duration?: number;
  color?: string;
}
export interface AreaChartXAxisProps {
  ticks?: number;
  format?: (datum: AreaChartDatum, index: number) => string;
  className?: string;
}
export interface AreaChartYAxisProps {
  ticks?: number;
  format?: (value: number) => string;
  className?: string;
}
export interface AreaChartTooltipProps {
  color?: string;
  formatValue?: (value: number, key: string) => string;
  formatX?: (datum: AreaChartDatum) => string;
  className?: string;
}
export interface AreaChartLegendProps extends ViewProps {
  className?: string;
  labels?: Record<string, string>;
}
export interface AreaChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  labels?: Record<string, string>;
  legend?: boolean;
  children?: ReactNode;
}
