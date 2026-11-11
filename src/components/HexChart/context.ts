import { createContext, useContext, useEffect, useId } from "react";
import type { ReactNode } from "react";

import type { ChartGraphicsStore } from "../../primitives/chart-graphics-store";
import type { ObservableNumber } from "../../primitives/observable-number";
import type {
  HexDatum,
  HexPlan,
  HexMetrics,
  HexChartStatus,
  HexShape,
} from "./types";

export interface HexContextValue {
  data: HexDatum[];
  total: number;
  width: number;
  height: number;
  metrics: HexMetrics;
  columns: number;
  rows: number;
  left: number;
  top: number;
  plan: HexPlan;
  colors: string[];
  status: HexChartStatus;
  clipId: string;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  graphics: ChartGraphicsStore;
  reveal: ObservableNumber;
  shape: HexShape;
  fieldWidth: number;
  fieldHeight: number;
}
export const HexChartContext = createContext<HexContextValue | null>(null);
export const HexOrderContext = createContext(0);
export const useChart = (part: string) => {
  const chart = useContext(HexChartContext);
  if (!chart) {
    throw new Error(`${part} must be used within a <HexChart>`);
  }
  return chart;
};
export const useHexChart = () => {
  const { data, plan, total, activeIndex } = useChart("useHexChart");
  const series = activeIndex >= 0 ? (data[activeIndex] ?? null) : null;
  return {
    activeCells: activeIndex >= 0 ? (plan.counts[activeIndex] ?? 0) : 0,
    activeFraction: series && total > 0 ? Math.max(0, series.value) / total : 0,
    activeIndex,
    activeSeries: series,
  };
};
export const useHexGraphic = (node: ReactNode) => {
  const { graphics } = useChart("HexChart graphics");
  const id = useId();
  const order = useContext(HexOrderContext);
  useEffect(() => {
    graphics.set({ id, layer: "grid", node, order });
  }, [graphics, id, node, order]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
};
