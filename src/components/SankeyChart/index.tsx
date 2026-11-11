import { SankeyChartBreakdown, SankeyChartLegend } from "./footer";
import { SankeyChartLinks, SankeyChartNodes } from "./graphics";
import {
  SankeyChartLabels,
  SankeyChartTooltip,
  SankeyChartHeader,
} from "./labels";
import { SankeyChartRoot } from "./root";
import { SankeyChartSkeleton } from "./skeleton";

export { useSankeyChart } from "./use-sankey";
export type { SankeyAlign, SankeyCollapse } from "./sankey-layout";
export type {
  SankeyOrientation,
  SankeyChartStatus,
  SankeyNode,
  SankeyLink,
  SankeyChartFlow,
  SankeyChartProps,
  SankeyChartHandle,
  SankeyChartLinksProps,
  SankeyChartNodesProps,
  SankeyChartLabelsProps,
  SankeyChartTooltipProps,
  SankeyChartBreakdownProps,
  SankeyChartLegendProps,
  SankeyChartSkeletonProps,
  SankeyChartHeaderProps,
} from "./types";
export const SankeyChart = Object.assign(SankeyChartRoot, {
  Breakdown: SankeyChartBreakdown,
  Header: SankeyChartHeader,
  Labels: SankeyChartLabels,
  Legend: SankeyChartLegend,
  Links: SankeyChartLinks,
  Nodes: SankeyChartNodes,
  Skeleton: SankeyChartSkeleton,
  Tooltip: SankeyChartTooltip,
});
