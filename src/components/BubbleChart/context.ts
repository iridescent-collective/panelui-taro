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
  BubbleChartDatum,
  BubbleChartPoint,
  BubbleChartStatus,
  ResolvedBubble,
} from "./types";

export interface BubbleContextValue {
  data: BubbleChartDatum[];
  xDataKey: string;
  yDataKey: string;
  labelKey?: string;
  plot: Plot;
  status: BubbleChartStatus;
  bubbles: ResolvedBubble[];
  domains: ObservableValue<readonly number[]>;
  xExtent: [number, number];
  yExtent: [number, number];
  sizeExtent: [number, number] | null;
  sizeRange: [number, number];
  reveal: ObservableNumber;
  activeIndexJS: number;
  setActivePoint: (point: BubbleChartPoint | null) => void;
  graphics: ChartGraphicsStore;
  width: number;
  height: number;
}
export const BubbleChartContext = createContext<BubbleContextValue | null>(
  null
);
export const BubbleOrderContext = createContext(0);
export const useChart = (part: string) => {
  const chart = useContext(BubbleChartContext);
  if (!chart) {
    throw new Error(`${part} must be used within a <BubbleChart>`);
  }
  return chart;
};
export const useBubbleChart = () => {
  const { bubbles, activeIndexJS } = useChart("useBubbleChart");
  return {
    activeIndex: activeIndexJS,
    activePoint:
      bubbles.find((bubble) => bubble.index === activeIndexJS) ?? null,
  };
};
export const useBubbleFrame = () => {
  const { domains, reveal } = useChart("BubbleChart frame");
  const extent = useSyncExternalStore(
    domains.subscribe,
    domains.getSnapshot,
    domains.getSnapshot
  );
  const grow = useSyncExternalStore(
    reveal.subscribe,
    reveal.getSnapshot,
    reveal.getSnapshot
  );
  return {
    grow,
    xMax: extent[1],
    xMin: extent[0],
    yMax: extent[3],
    yMin: extent[2],
  };
};
export const useBubbleGraphic = (node: ReactNode, offset = 0) => {
  const { graphics } = useChart("BubbleChart geometry");
  const id = useId();
  const order = useContext(BubbleOrderContext) + offset;
  useEffect(() => {
    graphics.set({ id, layer: "grid", node, order });
  }, [graphics, id, node, order]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
};
