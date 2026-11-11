import { createContext, useContext } from "react";

import type { ChartGraphicsStore } from "../../primitives/chart-graphics-store";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { PathPoint } from "../../primitives/wedge-hit";
import type { SliceAngles } from "./math";
import type { PieChartStatus, PieDatum } from "./types";

export interface PieHitTarget {
  id: string;
  index: number;
  order: number;
  contours: PathPoint[][];
}
export interface PieChartContextValue {
  data: PieDatum[];
  total: number;
  size: number;
  radius: number;
  hole: number;
  colors: string[];
  slices: SliceAngles[];
  origin: number;
  span: number;
  reveal: ObservableNumber;
  status: PieChartStatus;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  graphics: ChartGraphicsStore;
  targets: Map<string, PieHitTarget>;
}
export const PieChartContext = createContext<PieChartContextValue | null>(null);
export const PieOrderContext = createContext(0);
export const useChart = (part: string) => {
  const context = useContext(PieChartContext);
  if (!context) {
    throw new Error(`${part} must be used within a <PieChart>`);
  }
  return context;
};
export const usePieChart = () => {
  const { data, slices, activeIndex } = useChart("usePieChart");
  return {
    activeFraction: activeIndex >= 0 ? (slices[activeIndex]?.fraction ?? 0) : 0,
    activeIndex,
    activeSlice: activeIndex >= 0 ? (data[activeIndex] ?? null) : null,
  };
};
