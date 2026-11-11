import { PieChartCenter } from "./center";
import { PieChartHeader } from "./header";
import { PieChartLegend } from "./legend";
import { PieChartRoot } from "./root";
import { PieChartSkeleton } from "./skeleton";
import { PieChartSlices } from "./slices";

export { usePieChart } from "./context";
export type {
  PieChartStatus,
  PieDatum,
  PieChartProps,
  PieChartHandle,
  PieChartSlicesProps,
  PieChartSkeletonProps,
  PieChartCenterProps,
  PieChartLegendProps,
  PieChartHeaderProps,
} from "./types";
export const PieChart = Object.assign(PieChartRoot, {
  Center: PieChartCenter,
  Header: PieChartHeader,
  Legend: PieChartLegend,
  Skeleton: PieChartSkeleton,
  Slices: PieChartSlices,
});
