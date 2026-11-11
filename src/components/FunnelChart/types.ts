import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { LineChartLayoutEvent } from "../LineChart/types";

type ViewProps = ComponentProps<typeof View>;
export type FunnelChartStatus = "loading" | "ready";
export type FunnelEdges = "curved" | "straight";
export interface FunnelDatum {
  label: string;
  value: number;
  color?: string;
}
export interface Band {
  offset: number;
  length: number;
  head: number;
  tail: number;
}
export interface FunnelChartProps extends ViewProps {
  onLayout?: (event: LineChartLayoutEvent) => void;
  className?: string;
  data: FunnelDatum[];
  height?: number;
  stageSize?: number;
  gap?: number;
  layers?: number;
  edges?: FunnelEdges;
  minWidth?: number;
  color?: string;
  animationDuration?: number;
  staggerDelay?: number;
  status?: FunnelChartStatus;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  children?: ReactNode;
}
export interface FunnelChartHandle {
  replay: () => void;
}
export interface FunnelChartStagesProps {
  dimOpacity?: number;
}
export interface FunnelChartSkeletonProps {
  color?: string;
}
export type FunnelShare = "previous" | "top" | "none";
export interface FunnelChartLabelsProps {
  className?: string;
  formatValue?: (value: number, stage: FunnelDatum) => string;
  formatShare?: (share: number, stage: FunnelDatum) => string;
  share?: FunnelShare;
  showValue?: boolean;
  showLabel?: boolean;
}
export type FunnelLegendLayout = "list" | "inline";
export interface FunnelChartLegendProps extends ViewProps {
  className?: string;
  layout?: FunnelLegendLayout;
  showValue?: boolean;
  formatValue?: (value: number, stage: FunnelDatum) => string;
}
export interface FunnelChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  children?: ReactNode;
}
