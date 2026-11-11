import { PolarAreaChartGrid } from "./grid";
import { PolarAreaChartHeader } from "./header";
import { PolarAreaChartLabels } from "./labels";
import { PolarAreaChartLegend } from "./legend";
import { PolarAreaChartRoot } from "./root";
import { PolarAreaChartSkeleton } from "./skeleton";
import { PolarAreaChartTooltip } from "./tooltip";
import { PolarAreaChartWedges } from "./wedges";

export { usePolarAreaChart } from "./context";
export type {
  PolarAreaChartStatus,
  PolarAreaScale,
  PolarAreaDatum,
  PolarAreaChartProps,
  PolarAreaChartHandle,
  PolarAreaChartWedgesProps,
  PolarAreaChartGridProps,
  PolarAreaChartLabelsProps,
  PolarAreaChartTooltipProps,
  PolarAreaChartLegendProps,
  PolarAreaChartSkeletonProps,
  PolarAreaChartHeaderProps,
} from "./types";
export const PolarAreaChart = Object.assign(PolarAreaChartRoot, {
  Grid: PolarAreaChartGrid,
  Header: PolarAreaChartHeader,
  Labels: PolarAreaChartLabels,
  Legend: PolarAreaChartLegend,
  Skeleton: PolarAreaChartSkeleton,
  Tooltip: PolarAreaChartTooltip,
  Wedges: PolarAreaChartWedges,
});
