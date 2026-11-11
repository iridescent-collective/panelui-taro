import { RingChartCenter } from "./center";
import { RingChartHeader } from "./header";
import { RingChartLegend } from "./legend";
import { RingChartRing } from "./ring";
import { RingChartRoot } from "./root";

export { useRingChart } from "./context";
export type {
  RingDatum,
  RingChartProps,
  RingChartHandle,
  RingChartRingProps,
  RingChartCenterProps,
  RingChartLegendProps,
  RingChartHeaderProps,
} from "./types";
export const RingChart = Object.assign(RingChartRoot, {
  Center: RingChartCenter,
  Header: RingChartHeader,
  Legend: RingChartLegend,
  Ring: RingChartRing,
});
