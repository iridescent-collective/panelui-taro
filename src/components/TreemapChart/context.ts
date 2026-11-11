import {
  createContext,
  useContext,
  useEffect,
  useId,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import type { ChartGraphicsStore } from "../../primitives/chart-graphics-store";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { TreemapTile, TreemapChartStatus } from "./types";

export interface TreemapContextValue {
  tiles: TreemapTile[];
  width: number;
  height: number;
  total: number;
  cornerRadius: number;
  minLabelSize: number;
  reveal: ObservableNumber;
  windows: { from: number; to: number }[];
  status: TreemapChartStatus;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  graphics: ChartGraphicsStore;
}
export const TreemapChartContext = createContext<TreemapContextValue | null>(
  null
);
export const useChart = (part: string) => {
  const chart = useContext(TreemapChartContext);
  if (!chart) {
    throw new Error(`${part} must be used within a <TreemapChart>`);
  }
  return chart;
};
export const useTreemapChart = () => {
  const { tiles, total, activeIndex } = useChart("useTreemapChart");
  return {
    activeIndex,
    activeTile: activeIndex >= 0 ? (tiles[activeIndex] ?? null) : null,
    tiles,
    total,
  };
};
export const useTreemapReveal = () => {
  const { reveal } = useChart("TreemapChart frame");
  return useSyncExternalStore(
    reveal.subscribe,
    reveal.getSnapshot,
    reveal.getSnapshot
  );
};
export const useTreemapGraphic = (node: ReactNode) => {
  const { graphics } = useChart("TreemapChart geometry");
  const id = useId();
  useEffect(() => {
    graphics.set({ id, layer: "grid", node, order: 0 });
  }, [graphics, id, node]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
};
