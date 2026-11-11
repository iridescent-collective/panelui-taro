import { LineChartGrid } from "../LineChart/geometry";
import { CandlestickChartXAxis, CandlestickChartYAxis } from "./axis";
import { CandlestickChartCandles } from "./candles";
import { CandlestickChartHeader, CandlestickChartLegend } from "./labels";
import { CandlestickChartRoot } from "./root";
import { CandlestickChartTooltip } from "./tooltip";

export { useCandlestickChart } from "./root";
export type {
  CandlestickChartStatus,
  CandlestickChartDatum,
  CandlestickChartProps,
  CandlestickChartHandle,
  CandlestickChartGridProps,
  CandlestickChartCandlesProps,
  CandlestickChartXAxisProps,
  CandlestickChartYAxisProps,
  CandlestickChartTooltipProps,
  CandlestickChartHeaderProps,
  CandlestickChartLegendProps,
} from "./types";
export const CandlestickChart = Object.assign(CandlestickChartRoot, {
  Candles: CandlestickChartCandles,
  Grid: LineChartGrid,
  Header: CandlestickChartHeader,
  Legend: CandlestickChartLegend,
  Tooltip: CandlestickChartTooltip,
  XAxis: CandlestickChartXAxis,
  YAxis: CandlestickChartYAxis,
});
