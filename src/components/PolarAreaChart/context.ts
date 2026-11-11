import { createContext, useContext } from "react";

import type { ChartGraphicsStore } from "../../primitives/chart-graphics-store";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { PathPoint } from "../../primitives/wedge-hit";
import type { WedgeGeometry } from "./math";
import type {
  PolarAreaChartStatus,
  PolarAreaDatum,
  PolarAreaScale,
} from "./types";

export interface PolarHitTarget {
  id: string;
  index: number;
  order: number;
  contours: PathPoint[][];
}
export interface PolarAreaChartContextValue {
  data: PolarAreaDatum[];
  maxValue: number;
  scale: PolarAreaScale;
  radiusOf: (value: number) => number;
  size: number;
  radius: number;
  colors: string[];
  wedges: WedgeGeometry[];
  origin: number;
  reveal: ObservableNumber;
  status: PolarAreaChartStatus;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  graphics: ChartGraphicsStore;
  targets: Map<string, PolarHitTarget>;
}
export const PolarAreaChartContext =
  createContext<PolarAreaChartContextValue | null>(null);
export const PolarOrderContext = createContext(0);
export const useChart = (part: string) => {
  const context = useContext(PolarAreaChartContext);
  if (!context) {
    throw new Error(`${part} must be used within a <PolarAreaChart>`);
  }
  return context;
};
export const usePolarAreaChart = () => {
  const { data, wedges, activeIndex } = useChart("usePolarAreaChart");
  return {
    activeFraction: activeIndex >= 0 ? (wedges[activeIndex]?.fraction ?? 0) : 0,
    activeIndex,
    activeWedge: activeIndex >= 0 ? (data[activeIndex] ?? null) : null,
  };
};
