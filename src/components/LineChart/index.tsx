import { LineChartXAxis, LineChartYAxis } from "./axis";
import {
  LineChartArea,
  LineChartGrid,
  LineChartLine,
  LineChartSkeleton,
} from "./geometry";
import { LineChartHeader, LineChartLegend } from "./labels";
import { LineChartRoot } from "./root";
import { LineChartTooltip } from "./tooltip";

export { useLineChart } from "./context";
export type {
  LineChartProps,
  LineChartStatus,
  LineChartCurve,
  LineChartDatum,
  LineChartHandle,
  LineChartGridProps,
  LineChartLineProps,
  LineChartAreaProps,
  LineChartSkeletonProps,
  LineChartXAxisProps,
  LineChartYAxisProps,
  LineChartTooltipProps,
  LineChartLegendProps,
  LineChartHeaderProps,
  LineChartLayoutEvent,
} from "./types";
export const LineChart = Object.assign(LineChartRoot, {
  Area: LineChartArea,
  Grid: LineChartGrid,
  Header: LineChartHeader,
  Legend: LineChartLegend,
  Line: LineChartLine,
  Skeleton: LineChartSkeleton,
  Tooltip: LineChartTooltip,
  XAxis: LineChartXAxis,
  YAxis: LineChartYAxis,
});
