import { MirrorAreaChartXAxis, MirrorAreaChartYAxis } from "./axis";
import {
  MirrorAreaChartArea,
  MirrorAreaChartGrid,
  MirrorAreaChartBaseline,
  MirrorAreaChartSkeleton,
} from "./graphics";
import { MirrorAreaChartHeader, MirrorAreaChartLegend } from "./labels";
import { MirrorAreaChartRoot } from "./root";
import { MirrorAreaChartTooltip } from "./tooltip";

export { useMirrorAreaChart } from "./context";
export type {
  MirrorAreaChartStatus,
  MirrorAreaChartSide,
  MirrorAreaChartDatum,
  MirrorAreaChartProps,
  MirrorAreaChartHandle,
  MirrorAreaChartGridProps,
  MirrorAreaChartBaselineProps,
  MirrorAreaChartAreaProps,
  MirrorAreaChartSkeletonProps,
  MirrorAreaChartXAxisProps,
  MirrorAreaChartYAxisProps,
  MirrorAreaChartTooltipProps,
  MirrorAreaChartLegendProps,
  MirrorAreaChartHeaderProps,
} from "./types";
export const MirrorAreaChart = Object.assign(MirrorAreaChartRoot, {
  Area: MirrorAreaChartArea,
  Baseline: MirrorAreaChartBaseline,
  Grid: MirrorAreaChartGrid,
  Header: MirrorAreaChartHeader,
  Legend: MirrorAreaChartLegend,
  Skeleton: MirrorAreaChartSkeleton,
  Tooltip: MirrorAreaChartTooltip,
  XAxis: MirrorAreaChartXAxis,
  YAxis: MirrorAreaChartYAxis,
});
