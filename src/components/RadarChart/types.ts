import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { SeriesColorIndex } from "../../lib/chart";
import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type RadarChartStatus = "loading" | "ready";
export type RadarChartDatum = Record<
  string,
  string | number | null | undefined
>;
export interface RadarChartProps extends Omit<ViewProps, "children"> {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onLayout?: (event: LineChartLayoutEvent) => void;
  className?: string;
  data: RadarChartDatum[];
  axisKey?: string;
  status?: RadarChartStatus;
  size?: number;
  aspectRatio?: number;
  domain?: [number, number];
  animationDuration?: number;
  compact?: boolean;
  children?: ReactNode;
  accessibilityLabelForDatum?: ChartAccessibilityProps<RadarChartDatum>["accessibilityLabelForDatum"];
  onAccessibilityDatumPress?: ChartAccessibilityProps<RadarChartDatum>["onAccessibilityDatumPress"];
}
export interface RadarChartHandle {
  replay: () => void;
}
export interface RadarChartGridProps {
  rings?: number;
  color?: string;
  circular?: boolean;
  spokes?: boolean;
}
export interface RadarChartAxisProps {
  color?: string;
  fontSize?: number;
  offset?: number;
  formatLabel?: (label: string, index: number) => string;
}
export interface RadarChartSeriesProps {
  dataKey: string;
  name?: string;
  color?: string;
  colorIndex?: SeriesColorIndex;
  strokeWidth?: number;
  fillOpacity?: number;
  showDots?: boolean;
}
export interface RadarChartHeaderProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  legend?: boolean;
  children?: ReactNode;
}
export interface RadarChartLegendProps {
  className?: string;
  formatName?: (key: string) => string;
}
