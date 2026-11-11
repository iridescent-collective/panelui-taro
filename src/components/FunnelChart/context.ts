import { createContext, useContext } from "react";

import type { ChartGraphicsStore } from "../../primitives/chart-graphics-store";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { FunnelDatum, FunnelChartStatus, Band } from "./types";

export interface FunnelChartContextValue {
  data: FunnelDatum[];
  width: number;
  height: number;
  textBand: number;
  middle: number;
  bands: Band[];
  shares: number[];
  steps: number[];
  colors: string[];
  strengths: number[];
  layers: number;
  curve: number;
  reveal: ObservableNumber;
  windows: { from: number; to: number }[];
  status: FunnelChartStatus;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  graphics: ChartGraphicsStore;
  targets: Map<
    string,
    {
      id: string;
      index: number;
      order: number;
      hit: (x: number, y: number) => boolean;
    }
  >;
}
export const FunnelChartContext = createContext<FunnelChartContextValue | null>(
  null
);
export const FunnelOrderContext = createContext(0);
export const useChart = (part: string) => {
  const context = useContext(FunnelChartContext);
  if (!context) {
    throw new Error(`${part} must be used within a <FunnelChart>`);
  }
  return context;
};
export const useFunnelChart = () => {
  const { data, shares, steps, activeIndex } = useChart("useFunnelChart");
  return {
    activeIndex,
    activeShare: activeIndex >= 0 ? (shares[activeIndex] ?? 0) : 0,
    activeStage: activeIndex >= 0 ? (data[activeIndex] ?? null) : null,
    activeStep: activeIndex >= 0 ? (steps[activeIndex] ?? 0) : 0,
  };
};
