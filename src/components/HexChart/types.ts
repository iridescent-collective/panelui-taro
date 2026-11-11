import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ChartPoint } from "../../lib/chart";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export interface HexMetrics {
  radius: number;
  width: number;
  height: number;
  stepX: number;
  stepY: number;
}
export type HexShape = "blob" | "grid";
export interface HexCell {
  column: number;
  row: number;
}
export type HexChartStatus = "loading" | "ready";
export interface HexDatum {
  label: string;
  value: number;
  color?: string;
}
export interface HexPlan {
  paths: string[];
  field: string;
  counts: number[];
  labelAnchors: ChartPoint[];
  owners: number[];
}
export interface HexChartProps extends ViewProps {
  onLayout?: (event: LineChartLayoutEvent) => void;
  className?: string;
  data: HexDatum[];
  columns?: number;
  aspectRatio?: number;
  density?: number;
  shape?: HexShape;
  cellGap?: number;
  animationDuration?: number;
  status?: HexChartStatus;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  children?: ReactNode;
}
export interface HexChartHandle {
  replay: () => void;
}
export interface HexChartCellsProps {
  emptyColor?: string;
  dimOpacity?: number;
}
export interface HexChartSkeletonProps {
  color?: string;
}
export interface HexChartTooltipProps {
  formatValue?: (value: number, series: HexDatum) => string;
  showCells?: boolean;
  className?: string;
}
export interface HexChartLegendProps extends ViewProps {
  className?: string;
  showValue?: boolean;
}
export interface HexChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  labels?: Record<string, string>;
  legend?: boolean;
  children?: ReactNode;
}
