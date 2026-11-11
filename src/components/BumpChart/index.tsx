import { BumpChartXAxis, BumpChartYAxis } from "./axis";
import { BumpChartGrid, BumpChartLine, BumpChartSkeleton } from "./graphics";
import { BumpChartHeader, BumpChartLegend, BumpChartLabels } from "./labels";
import { BumpChartRoot } from "./root";
import { BumpChartTooltip } from "./tooltip";

export { bumpRanks } from "./math";
export { useBumpChart } from "./context";
export type {
  BumpChartStatus,
  BumpChartDatum,
  BumpRanks,
  BumpChartProps,
  BumpChartHandle,
  BumpChartGridProps,
  BumpChartLineProps,
  BumpChartSkeletonProps,
  BumpChartXAxisProps,
  BumpChartYAxisProps,
  BumpChartLabelsProps,
  BumpChartTooltipProps,
  BumpChartLegendProps,
  BumpChartHeaderProps,
} from "./types";
export const BumpChart = Object.assign(BumpChartRoot, {
  Grid: BumpChartGrid,
  Header: BumpChartHeader,
  Labels: BumpChartLabels,
  Legend: BumpChartLegend,
  Line: BumpChartLine,
  Skeleton: BumpChartSkeleton,
  Tooltip: BumpChartTooltip,
  XAxis: BumpChartXAxis,
  YAxis: BumpChartYAxis,
});
