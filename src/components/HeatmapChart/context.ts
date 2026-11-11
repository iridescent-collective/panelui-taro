import { createContext, useContext, useEffect, useId } from "react";
import type { ReactNode } from "react";

import type { ChartGraphicsStore } from "../../primitives/chart-graphics-store";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { HeatmapColumn, HeatmapCell, Grid } from "./types";

export interface HeatmapContextValue {
  data: HeatmapColumn[];
  grid: Grid;
  ramp: string[];
  opacities: number[];
  levelOf: (count: number) => number;
  cellAt: (column: number, row: number) => HeatmapCell;
  cornerRadius: number;
  inactiveOpacity: number;
  weekStartDay: number;
  activeCell: HeatmapCell | null;
  setActiveCell: (cell: HeatmapCell | null) => void;
  graphics: ChartGraphicsStore;
  reveal: ObservableNumber;
}
export const HeatmapContext = createContext<HeatmapContextValue | null>(null);
export const HeatmapOrderContext = createContext(0);
export const useHeatmap = (part: string) => {
  const chart = useContext(HeatmapContext);
  if (!chart) {
    throw new Error(`${part} must be used within a <HeatmapChart>`);
  }
  return chart;
};
export const useHeatmapChart = () => {
  const { activeCell } = useHeatmap("useHeatmapChart");
  return { activeCell };
};
export const useHeatmapGraphic = (node: ReactNode) => {
  const { graphics } = useHeatmap("HeatmapChart graphics");
  const id = useId();
  const order = useContext(HeatmapOrderContext);
  useEffect(() => {
    graphics.set({ id, layer: "grid", node, order });
  }, [graphics, id, node, order]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
};
