import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ChartAccessibilityProps } from "../../primitives/chart-accessibility";
import type { SankeyAlign, SankeyCollapse } from "./sankey-layout";

type ViewProps = ComponentProps<typeof View>;
export type SankeyOrientation = "horizontal" | "vertical";
export type SankeyChartStatus = "loading" | "ready";
export interface SankeyNode {
  id: string;
  label?: string;
  color?: string;
  value?: number;
}
export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}
export interface SankeyChartFlow {
  id: string;
  label: string;
  value: number;
  share: number;
  color: string;
}
export interface SankeyChartProps
  extends ViewProps, ChartAccessibilityProps<SankeyNode> {
  className?: string;
  nodes: SankeyNode[];
  links: SankeyLink[];
  height?: number;
  nodeWidth?: number;
  nodePadding?: number;
  orientation?: SankeyOrientation;
  collapse?: SankeyCollapse;
  align?: SankeyAlign;
  iterations?: number;
  curve?: number;
  color?: string;
  animationDuration?: number;
  staggerDelay?: number;
  status?: SankeyChartStatus;
  activeId?: string | null;
  onActiveIdChange?: (id: string | null) => void;
  onDropLinks?: (count: number) => void;
  accessibilityLabelForLink?: (link: SankeyLink, index: number) => string;
  children?: ReactNode;
}
export interface SankeyChartHandle {
  replay: () => void;
}
export interface SankeyChartLinksProps {
  opacity?: number;
  activeOpacity?: number;
  dimOpacity?: number;
}
export interface SankeyChartNodesProps {
  radius?: number;
  dimOpacity?: number;
  interactive?: boolean;
}
export interface SankeyChartLabelsProps {
  className?: string;
  formatValue?: (value: number, node: SankeyNode) => string;
  showValue?: boolean;
  minHeight?: number;
}
export interface SankeyChartTooltipProps {
  className?: string;
  formatValue?: (value: number) => string;
}
export interface SankeyChartBreakdownProps extends ViewProps {
  className?: string;
  formatValue?: (value: number) => string;
  maxRows?: number;
  onSelectNode?: (id: string) => void;
  placeholder?: string;
}
export interface SankeyChartLegendProps extends ViewProps {
  className?: string;
  limit?: number;
  showShare?: boolean;
}
export interface SankeyChartSkeletonProps {
  color?: string;
}
export interface SankeyChartHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string;
  caption?: string;
  children?: ReactNode;
}
