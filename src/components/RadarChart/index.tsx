import { RadarChartAxis } from "./axis";
import { RadarChartGrid } from "./grid";
import { RadarChartHeader } from "./header";
import { RadarChartLegend } from "./legend";
import { RadarChartRoot } from "./root";
import { RadarChartSeries } from "./series";

export { useRadarChart } from "./context";
export type {
  RadarChartStatus,
  RadarChartDatum,
  RadarChartProps,
  RadarChartHandle,
  RadarChartGridProps,
  RadarChartAxisProps,
  RadarChartSeriesProps,
  RadarChartHeaderProps,
  RadarChartLegendProps,
} from "./types";
export const RadarChart = Object.assign(RadarChartRoot, {
  Axis: RadarChartAxis,
  Grid: RadarChartGrid,
  Header: RadarChartHeader,
  Legend: RadarChartLegend,
  Series: RadarChartSeries,
});
