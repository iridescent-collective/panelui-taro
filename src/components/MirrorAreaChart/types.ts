import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ChartCurve, SeriesColorIndex } from "../../lib/chart";
import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type MirrorAreaChartStatus = "loading" | "ready";
export type MirrorAreaChartSide = "top" | "bottom";
export type MirrorAreaChartDatum = Record<
  string,
  string | number | null | undefined
>;
export interface MirrorSeries {
  key: string;
  color: string;
  label: string;
  side: MirrorAreaChartSide;
}
export interface MirrorAreaChartProps
  extends ViewProps, ChartAccessibilityProps<MirrorAreaChartDatum> {
  accessible?: boolean;
  onLayout?: (event: LineChartLayoutEvent) => void;
  className?: string;
  data: MirrorAreaChartDatum[];
  xDataKey?: string;
  split?: number;
  topDomain?: [number, number];
  bottomDomain?: [number, number];
  curve?: ChartCurve;
  status?: MirrorAreaChartStatus;
  aspectRatio?: number;
  animationDuration?: number;
  domainDuration?: number;
  onActiveIndexChange?: (
    index: number,
    datum: MirrorAreaChartDatum | null
  ) => void;
  compact?: boolean;
  children?: ReactNode;
}
export interface MirrorAreaChartHandle {
  replay: () => void;
}
export interface MirrorAreaChartGridProps {
  variant?: "dots" | "lines";
  spacing?: number;
  color?: string;
  opacity?: number;
}
export interface MirrorAreaChartBaselineProps {
  color?: string;
  strokeWidth?: number;
  opacity?: number;
}
export interface MirrorAreaChartAreaProps {
  dataKey: string;
  side?: MirrorAreaChartSide;
  label?: string;
  color?: string;
  colorIndex?: SeriesColorIndex;
  muted?: boolean;
  fillOpacity?: number;
  gradientToOpacity?: number;
  showLine?: boolean;
  strokeWidth?: number;
}
export interface MirrorAreaChartSkeletonProps {
  duration?: number;
  color?: string;
}
export interface MirrorAreaChartXAxisProps {
  ticks?: number;
  format?: (datum: MirrorAreaChartDatum, index: number) => string;
  className?: string;
}
export interface MirrorAreaChartYAxisProps {
  formatTop?: (value: number) => string;
  formatBottom?: (value: number) => string;
  className?: string;
}
export interface MirrorAreaChartTooltipProps {
  color?: string;
  formatValue?: (value: number, key: string) => string;
  formatX?: (datum: MirrorAreaChartDatum) => string;
  formatSummary?: (datum: MirrorAreaChartDatum) => string;
  className?: string;
}
export interface MirrorAreaChartLegendProps extends ViewProps {
  className?: string;
}
export interface MirrorAreaChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  legend?: boolean;
  children?: ReactNode;
}
