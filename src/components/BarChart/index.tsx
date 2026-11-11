import { LineChartHeader } from "../LineChart/labels";
import { BarChartXAxis, BarChartYAxis } from "./axis";
import { BarChartBar } from "./bar";
import { BarChartGrid } from "./grid";
import { BarChartLegend } from "./labels";
import { BarChartRoot } from "./root";
import { BarChartSkeleton } from "./skeleton";
import { BarChartTooltip } from "./tooltip";

export { useLineChart as useBarChart } from "../LineChart/context";
export type {
  BarChartStatus,
  BarChartOrientation,
  BarChartDatum,
  BarChartProps,
  BarChartHandle,
  BarChartGridProps,
  BarChartBarProps,
  BarChartSkeletonProps,
  BarChartXAxisProps,
  BarChartYAxisProps,
  BarChartTooltipProps,
  BarChartLegendProps,
  BarChartHeaderProps,
} from "./types";
export const BarChart = Object.assign(BarChartRoot, {
  Bar: BarChartBar,
  Grid: BarChartGrid,
  Header: LineChartHeader,
  Legend: BarChartLegend,
  Skeleton: BarChartSkeleton,
  Tooltip: BarChartTooltip,
  XAxis: BarChartXAxis,
  YAxis: BarChartYAxis,
});
