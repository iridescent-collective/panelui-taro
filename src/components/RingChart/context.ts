import { createContext, useContext } from "react";

import type { ChartGraphicsStore } from "../../primitives/chart-graphics-store";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { RingDatum } from "./types";

export interface RingHitTarget {
  id: string;
  index: number;
  order: number;
  radius: number;
}
export interface RingChartContextValue {
  data: RingDatum[];
  size: number;
  strokeWidth: number;
  ringGap: number;
  colors: string[];
  reveal: ObservableNumber;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  radiusOf: (index: number) => number;
  startAngle: number;
  arc: number;
  graphics: ChartGraphicsStore;
  targets: Map<string, RingHitTarget>;
}
export const RingChartContext = createContext<RingChartContextValue | null>(
  null
);
export const RingOrderContext = createContext(0);
export const useChart = (part: string) => {
  const context = useContext(RingChartContext);
  if (!context) {
    throw new Error(`${part} must be used within a <RingChart>`);
  }
  return context;
};
export const useRingChart = () => {
  const { data, activeIndex } = useChart("useRingChart");
  return {
    activeIndex,
    activeRing: activeIndex >= 0 ? (data[activeIndex] ?? null) : null,
  };
};
