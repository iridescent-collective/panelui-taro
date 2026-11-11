import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

type ViewProps = ComponentProps<typeof View>;
export type TreemapChartStatus = "loading" | "ready";
export interface TreemapDatum {
  label: string;
  value: number;
  color?: string;
}
export interface TreemapRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface TreemapTile extends TreemapRect {
  label: string;
  value: number;
  share: number;
  color: string;
  strength: number;
  sourceIndex: number;
}
export interface TreemapChartProps extends ViewProps {
  className?: string;
  data: TreemapDatum[];
  aspectRatio?: number;
  gap?: number;
  cornerRadius?: number;
  sort?: boolean;
  maxTiles?: number;
  otherLabel?: string;
  color?: string;
  minLabelSize?: number;
  animationDuration?: number;
  staggerDelay?: number;
  status?: TreemapChartStatus;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  children?: ReactNode;
}
export interface TreemapChartHandle {
  replay: () => void;
}
export interface TreemapChartTilesProps {
  dimOpacity?: number;
}
export interface TreemapChartSkeletonProps {
  duration?: number;
  color?: string;
}
export interface TreemapChartLabelsProps {
  showValue?: boolean;
  showShare?: boolean;
  formatValue?: (value: number, tile: TreemapTile) => string;
  className?: string;
}
export interface TreemapChartTooltipProps {
  formatValue?: (value: number, tile: TreemapTile) => string;
  className?: string;
}
export interface TreemapChartLegendProps extends ViewProps {
  className?: string;
  limit?: number;
  showShare?: boolean;
}
export interface TreemapChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  children?: ReactNode;
}
