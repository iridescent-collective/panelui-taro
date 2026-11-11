import { HeatmapXAxis, HeatmapYAxis } from "./axis";
import { HeatmapCells, HeatmapSeparator } from "./cells";
import { HeatmapHeader, HeatmapLegend } from "./labels";
import { HeatmapChartRoot } from "./root";
import { HeatmapTooltip } from "./tooltip";

export { useHeatmapChart } from "./context";
export { buildHeatmapCalendar } from "./math";
export type {
  HeatmapLayout,
  HeatmapBin,
  HeatmapColumn,
  HeatmapCell,
  HeatmapChartProps,
  HeatmapCellsProps,
  HeatmapSeparatorProps,
  HeatmapXAxisProps,
  HeatmapYAxisProps,
  HeatmapTooltipProps,
  HeatmapLegendProps,
  HeatmapHeaderProps,
} from "./types";
export const HeatmapChart = Object.assign(HeatmapChartRoot, {
  Cells: HeatmapCells,
  Header: HeatmapHeader,
  Legend: HeatmapLegend,
  Separator: HeatmapSeparator,
  Tooltip: HeatmapTooltip,
  XAxis: HeatmapXAxis,
  YAxis: HeatmapYAxis,
});
