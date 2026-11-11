import { ScatterChartXAxis, ScatterChartYAxis } from "./axis";
import {
  ScatterChartGrid,
  ScatterChartPoints,
  ScatterChartSkeleton,
} from "./graphics";
import { ScatterChartHeader, ScatterChartLegend } from "./labels";
import { ScatterChartRoot } from "./root";
import { ScatterChartTooltip } from "./tooltip";

export { useScatterChart } from "./context";
export type {
  ScatterChartStatus,
  ScatterChartDatum,
  ScatterChartPoint,
  ScatterChartProps,
  ScatterChartHandle,
  ScatterChartGridProps,
  ScatterChartPointsProps,
  ScatterChartSkeletonProps,
  ScatterChartXAxisProps,
  ScatterChartYAxisProps,
  ScatterChartTooltipProps,
  ScatterChartLegendProps,
  ScatterChartHeaderProps,
} from "./types";
export const ScatterChart = Object.assign(ScatterChartRoot, {
  Grid: ScatterChartGrid,
  Header: ScatterChartHeader,
  Legend: ScatterChartLegend,
  Points: ScatterChartPoints,
  Skeleton: ScatterChartSkeleton,
  Tooltip: ScatterChartTooltip,
  XAxis: ScatterChartXAxis,
  YAxis: ScatterChartYAxis,
});
