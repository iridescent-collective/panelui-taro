import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";
import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type CandlestickChartStatus = "loading" | "ready";
export type CandlestickChartDatum = Record<
  string,
  string | number | null | undefined
>;
export interface CandlestickChartProps
  extends ViewProps, ChartAccessibilityProps<CandlestickChartDatum> {
  accessible?: boolean;
  onLayout?: (event: LineChartLayoutEvent) => void;
  className?: string;
  data: CandlestickChartDatum[];
  xDataKey?: string;
  openDataKey?: string;
  highDataKey?: string;
  lowDataKey?: string;
  closeDataKey?: string;
  status?: CandlestickChartStatus;
  aspectRatio?: number;
  animationDuration?: number;
  domainDuration?: number;
  yDomain?: [number, number];
  candleGap?: number;
  candleWidth?: number;
  fadedOpacity?: number;
  onActiveIndexChange?: (
    index: number,
    datum: CandlestickChartDatum | null
  ) => void;
  compact?: boolean;
  children?: ReactNode;
}
export interface CandlestickChartHandle {
  replay: () => void;
}
export interface CandlestickChartGridProps {
  rows?: number;
  color?: string;
  dashArray?: string;
  opacity?: number;
}
export interface CandlestickChartCandlesProps {
  risingColor?: string;
  fallingColor?: string;
  cornerRadius?: number;
}
export interface CandlestickChartXAxisProps {
  ticks?: number;
  format?: (datum: CandlestickChartDatum, index: number) => string;
  className?: string;
}
export interface CandlestickChartYAxisProps {
  ticks?: number;
  format?: (value: number) => string;
  className?: string;
}
export interface CandlestickChartTooltipProps {
  formatValue?: (
    value: number,
    field: "open" | "high" | "low" | "close"
  ) => string;
  formatX?: (datum: CandlestickChartDatum) => string;
  showChange?: boolean;
  className?: string;
}
export interface CandlestickChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  legend?: boolean;
  risingLabel?: string;
  fallingLabel?: string;
  children?: ReactNode;
}
export interface CandlestickChartLegendProps extends ViewProps {
  className?: string;
  risingLabel?: string;
  fallingLabel?: string;
}
