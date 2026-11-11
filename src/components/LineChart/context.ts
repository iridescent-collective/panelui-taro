import { createContext, useContext, useSyncExternalStore } from "react";

import type { Plot } from "../../lib/chart";
import type { ChartGraphicsStore } from "../../primitives/chart-graphics-store";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { ObservableValue } from "../../primitives/observable-value";
import type { LineChartCurve, LineChartDatum, LineChartStatus } from "./types";

export interface LineChartContextValue {
  data: LineChartDatum[];
  xDataKey: string;
  plot: Plot;
  width: number;
  height: number;
  status: LineChartStatus;
  curve: LineChartCurve;
  series: [string, string][];
  registerSeries: (key: string, color: string) => void;
  unregisterSeries: (key: string) => void;
  domain: ObservableValue<readonly [number, number]>;
  extent: [number, number];
  activeIndexJS: number;
  setActiveIndexJS: (index: number) => void;
  graphics: ChartGraphicsStore;
  reveal: ObservableNumber;
}
export const LineChartContext = createContext<LineChartContextValue | null>(
  null
);
export const ChartGraphicOrderContext = createContext(0);
export const useChart = (component: string) => {
  const context = useContext(LineChartContext);
  if (!context) {
    throw new Error(`${component} must be used within a <LineChart>`);
  }
  return context;
};
export const useChartDomain = () => {
  const { domain } = useChart("LineChart domain");
  return useSyncExternalStore(
    domain.subscribe,
    domain.getSnapshot,
    domain.getSnapshot
  );
};
export const useLineChart = () => {
  const { data, activeIndexJS, xDataKey } = useChart("useLineChart");
  return {
    activeIndex: activeIndexJS,
    activePoint: activeIndexJS >= 0 ? (data[activeIndexJS] ?? null) : null,
    xDataKey,
  };
};
