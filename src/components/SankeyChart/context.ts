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
import type { SankeyLayout, SankeyLayoutNode } from "./sankey-layout";
import type {
  SankeyNode,
  SankeyLink,
  SankeyChartStatus,
  SankeyOrientation,
} from "./types";

export interface SankeyContextValue {
  nodes: SankeyNode[];
  links: SankeyLink[];
  layout: SankeyLayout;
  width: number;
  height: number;
  curve: number;
  colors: string[];
  windows: { from: number; to: number }[];
  reveal: ObservableNumber;
  status: SankeyChartStatus;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  labelFor: (id: string) => string;
  orientation: SankeyOrientation;
  datumFor: (node: SankeyLayoutNode) => SankeyNode;
  reportLabelled: (ids: string[] | null) => void;
  graphics: ChartGraphicsStore;
}
export const SankeyChartContext = createContext<SankeyContextValue | null>(
  null
);
export const useChart = (part: string) => {
  const chart = useContext(SankeyChartContext);
  if (!chart) {
    throw new Error(`${part} must be used within a <SankeyChart>`);
  }
  return chart;
};
export const useSankeyReveal = () => {
  const { reveal } = useChart("SankeyChart frame");
  return useSyncExternalStore(
    reveal.subscribe,
    reveal.getSnapshot,
    reveal.getSnapshot
  );
};
export const useSankeyGraphic = (node: ReactNode) => {
  const { graphics } = useChart("SankeyChart geometry");
  const id = useId();
  useEffect(() => {
    graphics.set({ id, layer: "grid", node, order: 0 });
  }, [graphics, id, node]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
};
