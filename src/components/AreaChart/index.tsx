import { LineChartXAxis, LineChartYAxis } from "../LineChart/axis";
import { LineChartGrid } from "../LineChart/geometry";
import { AreaChartArea } from "./area";
import { AreaChartHeader, AreaChartLegend } from "./labels";
import { AreaChartRoot } from "./root";
import { AreaChartSkeleton } from "./skeleton";
import { AreaChartTooltip } from "./tooltip";

export { useLineChart as useAreaChart } from "../LineChart/context";
export type {
  AreaChartStatus,
  AreaChartDatum,
  AreaChartProps,
  AreaChartHandle,
  AreaChartGridProps,
  AreaChartAreaProps,
  AreaChartSkeletonProps,
  AreaChartXAxisProps,
  AreaChartYAxisProps,
  AreaChartTooltipProps,
  AreaChartLegendProps,
  AreaChartHeaderProps,
} from "./types";
export const AreaChart = Object.assign(AreaChartRoot, {
  Area: AreaChartArea,
  Grid: LineChartGrid,
  Header: AreaChartHeader,
  Legend: AreaChartLegend,
  Skeleton: AreaChartSkeleton,
  Tooltip: AreaChartTooltip,
  XAxis: LineChartXAxis,
  YAxis: LineChartYAxis,
});
