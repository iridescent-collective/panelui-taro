import {
  TreemapChartHeader,
  TreemapChartLabels,
  TreemapChartTooltip,
  TreemapChartLegend,
} from "./labels";
import { TreemapChartRoot } from "./root";
import { TreemapChartSkeleton } from "./skeleton";
import { TreemapChartTiles } from "./tiles";

export { squarifyLayout } from "./math";
export { useTreemapChart } from "./context";
export type {
  TreemapChartStatus,
  TreemapDatum,
  TreemapRect,
  TreemapTile,
  TreemapChartProps,
  TreemapChartHandle,
  TreemapChartTilesProps,
  TreemapChartSkeletonProps,
  TreemapChartLabelsProps,
  TreemapChartTooltipProps,
  TreemapChartLegendProps,
  TreemapChartHeaderProps,
} from "./types";
export const TreemapChart = Object.assign(TreemapChartRoot, {
  Header: TreemapChartHeader,
  Labels: TreemapChartLabels,
  Legend: TreemapChartLegend,
  Skeleton: TreemapChartSkeleton,
  Tiles: TreemapChartTiles,
  Tooltip: TreemapChartTooltip,
});
