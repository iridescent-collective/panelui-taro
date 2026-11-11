import {
  createContext,
  useContext,
  useEffect,
  useId,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import type { Plot } from "../../lib/chart";
import type { ChartGraphicsStore } from "../../primitives/chart-graphics-store";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { ObservableValue } from "../../primitives/observable-value";
import type {
  BumpChartDatum,
  BumpChartStatus,
  BumpRanks,
  BumpSeries,
} from "./types";

export interface BumpContextValue {
  data: BumpChartDatum[];
  xDataKey: string;
  plot: Plot;
  pad: { top: number; right: number; bottom: number; left: number };
  status: BumpChartStatus;
  series: BumpSeries[];
  ranks: BumpRanks;
  rows: number;
  registerSeries: (series: BumpSeries) => void;
  unregisterSeries: (key: string) => void;
  positions: ObservableValue<{ from: BumpRanks; to: BumpRanks }>;
  morph: ObservableNumber;
  reveal: ObservableNumber;
  highlight: string | null;
  setHighlight: (key: string | null) => void;
  activeIndexJS: number;
  setActiveIndexJS: (index: number) => void;
  graphics: ChartGraphicsStore;
  width: number;
  height: number;
}
export const BumpChartContext = createContext<BumpContextValue | null>(null);
export const BumpOrderContext = createContext(0);
export const useChart = (part: string) => {
  const context = useContext(BumpChartContext);
  if (!context) {
    throw new Error(`${part} must be used within a <BumpChart>`);
  }
  return context;
};
export const useBumpChart = () => {
  const { activeIndexJS, data, xDataKey, ranks, highlight, setHighlight } =
    useChart("useBumpChart");
  return {
    activeIndex: activeIndexJS,
    activePoint: activeIndexJS < 0 ? null : (data[activeIndexJS] ?? null),
    highlight,
    ranks,
    setHighlight,
    xDataKey,
  };
};
export const useBumpFrame = () => {
  const { positions, morph } = useChart("BumpChart frame");
  return {
    ...useSyncExternalStore(
      positions.subscribe,
      positions.getSnapshot,
      positions.getSnapshot
    ),
    progress: useSyncExternalStore(
      morph.subscribe,
      morph.getSnapshot,
      morph.getSnapshot
    ),
  };
};
export const useBumpGraphic = (
  node: ReactNode,
  layer: "grid" | "series" = "grid",
  offset = 0
) => {
  const { graphics } = useChart("BumpChart geometry");
  const id = useId();
  const order = useContext(BumpOrderContext) + offset;
  useEffect(() => {
    graphics.set({ id, layer, node, order });
  }, [graphics, id, node, order, layer]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
};
