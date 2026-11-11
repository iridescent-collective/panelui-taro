import { createContext, useContext } from "react";

import type { ChartGraphicsStore } from "../../primitives/chart-graphics-store";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { RadarChartDatum, RadarChartStatus } from "./types";

export interface RadarChartContextValue {
  data: RadarChartDatum[];
  axisKey: string;
  cx: number;
  cy: number;
  radius: number;
  width: number;
  height: number;
  status: RadarChartStatus;
  domainMax: ObservableNumber;
  domainMin: ObservableNumber;
  reveal: ObservableNumber;
  series: [string, string][];
  registerSeries: (key: string, color: string) => void;
  unregisterSeries: (key: string) => void;
}
interface RadarRenderContextValue extends RadarChartContextValue {
  graphics: ChartGraphicsStore;
}
export const RadarChartContext = createContext<RadarRenderContextValue | null>(
  null
);
export const RadarOrderContext = createContext(0);
export const useChart = (part: string) => {
  const context = useContext(RadarChartContext);
  if (!context) {
    throw new Error(`${part} must be used inside <RadarChart>.`);
  }
  return context;
};
export const useRadarChart = (): RadarChartContextValue =>
  useChart("useRadarChart");
