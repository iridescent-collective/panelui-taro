import { LineChartHeader } from "../LineChart/labels";
import { PyramidChartXAxis, PyramidChartYAxis } from "./axis";
import { PyramidChartBar } from "./bar";
import { PyramidChartGrid } from "./grid";
import { PyramidChartLegend } from "./labels";
import { PyramidChartRoot } from "./root";
import { PyramidChartSkeleton } from "./skeleton";
import { PyramidChartTooltip } from "./tooltip";

export { useLineChart as usePyramidChart } from "../LineChart/context";
export type {
  PyramidChartStatus,
  PyramidChartSide,
  PyramidChartLabelPlacement,
  PyramidChartDatum,
  PyramidChartProps,
  PyramidChartHandle,
  PyramidChartGridProps,
  PyramidChartBarProps,
  PyramidChartSkeletonProps,
  PyramidChartXAxisProps,
  PyramidChartYAxisProps,
  PyramidChartTooltipProps,
  PyramidChartLegendProps,
  PyramidChartHeaderProps,
} from "./types";
export const PyramidChart = Object.assign(PyramidChartRoot, {
  Bar: PyramidChartBar,
  Grid: PyramidChartGrid,
  Header: LineChartHeader,
  Legend: PyramidChartLegend,
  Skeleton: PyramidChartSkeleton,
  Tooltip: PyramidChartTooltip,
  XAxis: PyramidChartXAxis,
  YAxis: PyramidChartYAxis,
});
