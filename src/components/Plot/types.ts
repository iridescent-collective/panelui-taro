import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { Plot as PlotBox } from "../../lib/chart";
import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";
import type { ObservableNumber } from "../../primitives/observable-number";

export type PlotStatus = "loading" | "ready";
export type PlotCurve = "monotone" | "linear";
export type PlotDatum = Record<string, string | number | null | undefined>;
export type PlotScale = "point" | "band";
export type PlotBound = number | "auto";
export interface PlotGeometry {
  data: PlotDatum[];
  xDataKey: string;
  plot: PlotBox;
  xScale: PlotScale;
  status: PlotStatus;
  domainMin: ObservableNumber;
  domainMax: ObservableNumber;
  extent: [number, number];
  reveal: ObservableNumber;
  palette: string[];
  series: [string, string][];
  registerSeries: (key: string, color: string) => void;
  unregisterSeries: (key: string, color?: string) => void;
  activeIndex: ObservableNumber;
  activeIndexJS: number;
  setActiveIndexJS: (index: number) => void;
}
export interface PlotProps
  extends ComponentProps<typeof View>, ChartAccessibilityProps<PlotDatum> {
  accessible?: boolean;
  onLayout?: (event: PlotLayoutEvent) => void;
  className?: string;
  data: PlotDatum[];
  xDataKey?: string;
  status?: PlotStatus;
  aspectRatio?: number;
  animationDuration?: number;
  domainDuration?: number;
  yDomain?: [PlotBound, PlotBound];
  nice?: boolean;
  xScale?: PlotScale;
  curve?: PlotCurve;
  onActiveIndexChange?: (index: number, datum: PlotDatum | null) => void;
  compact?: boolean;
  children?: ReactNode;
}
export interface PlotHandle {
  replay: () => void;
}
export interface PlotGridProps {
  rows?: number;
  color?: string;
  dashArray?: string;
  opacity?: number;
}
export interface PlotSeriesProps {
  dataKey: string;
  color?: string;
  colorIndex?: number;
}
export interface PlotLineProps extends PlotSeriesProps {
  strokeWidth?: number;
  curve?: PlotCurve;
  dashArray?: string;
}
export interface PlotAreaProps extends PlotSeriesProps {
  opacity?: number;
  curve?: PlotCurve;
}
export interface PlotBarsProps extends PlotSeriesProps {
  gap?: number;
  radius?: number;
  opacity?: number;
  baseline?: number;
}
export interface PlotDotsProps extends PlotSeriesProps {
  size?: number;
  ringWidth?: number;
}
export interface PlotLayerProps {
  children?: ReactNode;
}
export interface PlotOverlayProps {
  className?: string;
  children?: ReactNode;
}
export interface PlotRuleProps {
  y?: number;
  x?: number;
  label?: string;
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
  opacity?: number;
  labelPlacement?: "start" | "end";
  labelClassName?: string;
  className?: string;
}
export interface PlotXAxisProps {
  ticks?: number;
  format?: (datum: PlotDatum, index: number) => string;
  className?: string;
}
export interface PlotYAxisProps {
  ticks?: number;
  format?: (value: number) => string;
  className?: string;
}
export interface PlotCursorProps {
  color?: string;
  showLine?: boolean;
}
export interface PlotTooltipProps {
  formatValue?: (value: number, key: string) => string;
  formatX?: (datum: PlotDatum) => string;
  children?: (datum: PlotDatum, index: number) => ReactNode;
  className?: string;
}
export interface PlotHeaderProps extends ComponentProps<typeof View> {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  children?: ReactNode;
}
export interface PlotLegendProps extends ComponentProps<typeof View> {
  className?: string;
  labels?: Record<string, string>;
}
export interface PlotLayoutEvent {
  nativeEvent: {
    layout: {
      width: number;
      height: number;
      x: number;
      y: number;
    };
  };
}
