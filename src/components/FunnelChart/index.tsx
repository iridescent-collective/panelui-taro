import { FunnelChartHeader } from "./header";
import { FunnelChartLabels } from "./labels";
import { FunnelChartLegend } from "./legend";
import { FunnelChartRoot } from "./root";
import { FunnelChartSkeleton } from "./skeleton";
import { FunnelChartStages } from "./stages";

export { useFunnelChart } from "./context";
export type {
  FunnelChartStatus,
  FunnelEdges,
  FunnelDatum,
  FunnelChartProps,
  FunnelChartHandle,
  FunnelChartStagesProps,
  FunnelChartSkeletonProps,
  FunnelShare,
  FunnelChartLabelsProps,
  FunnelLegendLayout,
  FunnelChartLegendProps,
  FunnelChartHeaderProps,
} from "./types";
export const FunnelChart = Object.assign(FunnelChartRoot, {
  Header: FunnelChartHeader,
  Labels: FunnelChartLabels,
  Legend: FunnelChartLegend,
  Skeleton: FunnelChartSkeleton,
  Stages: FunnelChartStages,
});
