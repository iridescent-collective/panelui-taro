import { BubbleChartXAxis, BubbleChartYAxis } from "./axis";
import { BubbleChartQuadrants, BubbleChartSizeKey } from "./decorations";
import {
  BubbleChartGrid,
  BubbleChartTrend,
  BubbleChartBubbles,
  BubbleChartSkeleton,
} from "./graphics";
import {
  BubbleChartLabels,
  BubbleChartLegend,
  BubbleChartHeader,
} from "./labels";
import { BubbleChartRoot } from "./root";
import { BubbleChartTooltip } from "./tooltip";

export { useBubbleChart } from "./context";
export type {
  BubbleChartStatus,
  BubbleChartDatum,
  BubbleChartPoint,
  BubbleChartProps,
  BubbleChartHandle,
  BubbleChartGridProps,
  BubbleChartTrendProps,
  BubbleChartBubblesProps,
  BubbleChartSkeletonProps,
  BubbleChartLabelsProps,
  BubbleChartQuadrantsProps,
  BubbleChartSizeKeyProps,
  BubbleChartXAxisProps,
  BubbleChartYAxisProps,
  BubbleChartTooltipProps,
  BubbleChartLegendProps,
  BubbleChartHeaderProps,
} from "./types";
export const BubbleChart = Object.assign(BubbleChartRoot, {
  Bubbles: BubbleChartBubbles,
  Grid: BubbleChartGrid,
  Header: BubbleChartHeader,
  Labels: BubbleChartLabels,
  Legend: BubbleChartLegend,
  Quadrants: BubbleChartQuadrants,
  SizeKey: BubbleChartSizeKey,
  Skeleton: BubbleChartSkeleton,
  Tooltip: BubbleChartTooltip,
  Trend: BubbleChartTrend,
  XAxis: BubbleChartXAxis,
  YAxis: BubbleChartYAxis,
});
