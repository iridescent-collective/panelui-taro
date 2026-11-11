import { HexChartCells, HexChartSkeleton } from "./cells";
import { HexChartHeader, HexChartLegend } from "./labels";
import { HexChartRoot } from "./root";
import { HexChartTooltip } from "./tooltip";

export { useHexChart } from "./context";
export type {
  HexChartStatus,
  HexShape,
  HexDatum,
  HexChartProps,
  HexChartHandle,
  HexChartCellsProps,
  HexChartSkeletonProps,
  HexChartTooltipProps,
  HexChartLegendProps,
  HexChartHeaderProps,
} from "./types";
export const HexChart = Object.assign(HexChartRoot, {
  Cells: HexChartCells,
  Header: HexChartHeader,
  Legend: HexChartLegend,
  Skeleton: HexChartSkeleton,
  Tooltip: HexChartTooltip,
});
