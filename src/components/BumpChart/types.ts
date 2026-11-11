import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { SeriesColorIndex } from "../../lib/chart";
import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type BumpChartStatus = "loading" | "ready";
export type BumpChartDatum = Record<string, string | number | null | undefined>;
export type BumpRanks = Record<string, (number | null)[]>;
export interface BumpSeries {
  key: string;
  color: string;
  label: string;
  strokeWidth: number;
  showDots: boolean;
}
export interface BumpChartProps
  extends ViewProps, ChartAccessibilityProps<BumpChartDatum> {
  accessible?: boolean;
  onLayout?: (event: LineChartLayoutEvent) => void;
  className?: string;
  data: BumpChartDatum[];
  xDataKey?: string;
  values?: "rank" | "score";
  highlight?: string | null;
  defaultHighlight?: string | null;
  onHighlightChange?: (key: string | null) => void;
  status?: BumpChartStatus;
  aspectRatio?: number;
  animationDuration?: number;
  morphDuration?: number;
  onActiveIndexChange?: (index: number, datum: BumpChartDatum | null) => void;
  compact?: boolean;
  children?: ReactNode;
}
export interface BumpChartHandle {
  replay: () => void;
}
export interface BumpChartGridProps {
  vertical?: boolean;
  horizontal?: boolean;
  color?: string;
  dashArray?: string;
  opacity?: number;
}
export interface BumpChartLineProps {
  dataKey: string;
  label?: string;
  color?: string;
  colorIndex?: SeriesColorIndex;
  strokeWidth?: number;
  showDots?: boolean;
}
export interface BumpChartSkeletonProps {
  duration?: number;
  color?: string;
  rows?: number;
}
export interface BumpChartXAxisProps {
  ticks?: number;
  format?: (datum: BumpChartDatum, index: number) => string;
  className?: string;
}
export interface BumpChartYAxisProps {
  format?: (rank: number) => string;
  className?: string;
}
export interface BumpChartLabelsProps {
  width?: number;
  pressable?: boolean;
  className?: string;
}
export interface BumpChartTooltipProps {
  color?: string;
  formatRank?: (rank: number) => string;
  formatX?: (datum: BumpChartDatum) => string;
  className?: string;
}
export interface BumpChartLegendProps extends ViewProps {
  className?: string;
}
export interface BumpChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  legend?: boolean;
  children?: ReactNode;
}
