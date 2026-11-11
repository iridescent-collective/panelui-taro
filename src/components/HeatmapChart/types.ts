import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type HeatmapLayout = "fluid" | "fill";
export interface HeatmapBin {
  bin: number;
  count: number;
  date?: Date;
}
export interface HeatmapColumn {
  bin: number;
  bins: HeatmapBin[];
}
export interface HeatmapCell {
  column: number;
  row: number;
  count: number;
  level: number;
  date?: Date;
}
export interface Grid {
  size: number;
  gap: number;
  columns: number;
  rows: number;
  width: number;
  height: number;
}
export interface HeatmapChartProps
  extends ViewProps, ChartAccessibilityProps<HeatmapCell> {
  accessible?: boolean;
  onLayout?: (event: LineChartLayoutEvent) => void;
  className?: string;
  data: HeatmapColumn[];
  layout?: HeatmapLayout;
  binSize?: number;
  gap?: number;
  cornerRadius?: number;
  weekStartDay?: number;
  rows?: number;
  levels?: number[];
  levelColors?: string[];
  color?: string;
  emptyColor?: string;
  levelOpacity?: number[];
  animationDuration?: number;
  inactiveOpacity?: number;
  onActiveCellChange?: (cell: HeatmapCell | null) => void;
  children?: ReactNode;
}
export interface HeatmapCellsProps {
  cornerRadius?: number;
}
export interface HeatmapSeparatorProps {
  every?: "quarter" | number;
  color?: string;
  dashArray?: string;
}
export interface HeatmapXAxisProps {
  className?: string;
  formatLabel?: (date: Date, column: number) => string;
  labels?: string[];
}
export interface HeatmapYAxisProps {
  className?: string;
  width?: number;
  tickFilter?: "all" | "odd" | "even";
  labelFormat?: "initial" | "full";
  labels?: string[];
}
export interface HeatmapTooltipProps {
  className?: string;
  formatLabel?: (cell: HeatmapCell) => string;
  activateAfterLongPress?: number;
}
export interface HeatmapLegendProps {
  className?: string;
  lessLabel?: string;
  moreLabel?: string;
  swatchSize?: number;
}
export interface HeatmapHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  legend?: boolean;
  lessLabel?: string;
  moreLabel?: string;
  children?: ReactNode;
}
