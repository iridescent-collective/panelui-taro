import {
  createContext,
  useContext,
  useEffect,
  useId,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import type { Plot, ChartCurve } from "../../lib/chart";
import type { ChartGraphicsStore } from "../../primitives/chart-graphics-store";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { ObservableValue } from "../../primitives/observable-value";
import type {
  MirrorAreaChartDatum,
  MirrorAreaChartStatus,
  MirrorSeries,
} from "./types";

export interface MirrorContextValue {
  data: MirrorAreaChartDatum[];
  xDataKey: string;
  plot: Plot;
  pad: { top: number; right: number; bottom: number; left: number };
  baseline: number;
  status: MirrorAreaChartStatus;
  curve: ChartCurve;
  series: MirrorSeries[];
  registerSeries: (series: MirrorSeries) => void;
  unregisterSeries: (key: string) => void;
  domains: ObservableValue<readonly number[]>;
  topExtent: number;
  bottomExtent: number;
  grow: ObservableNumber;
  activeIndexJS: number;
  setActiveIndexJS: (index: number) => void;
  graphics: ChartGraphicsStore;
  width: number;
  height: number;
}
export const MirrorAreaChartContext = createContext<MirrorContextValue | null>(
  null
);
export const MirrorOrderContext = createContext(0);
export const useChart = (part: string) => {
  const chart = useContext(MirrorAreaChartContext);
  if (!chart) {
    throw new Error(`${part} must be used within a <MirrorAreaChart>`);
  }
  return chart;
};
export const useMirrorAreaChart = () => {
  const { activeIndexJS, data, xDataKey } = useChart("useMirrorAreaChart");
  return {
    activeIndex: activeIndexJS,
    activePoint: activeIndexJS < 0 ? null : (data[activeIndexJS] ?? null),
    xDataKey,
  };
};
export const useMirrorFrame = () => {
  const { domains, grow } = useChart("MirrorAreaChart frame");
  const extents = useSyncExternalStore(
    domains.subscribe,
    domains.getSnapshot,
    domains.getSnapshot
  );
  return {
    bottomMax: extents[1],
    grow: useSyncExternalStore(
      grow.subscribe,
      grow.getSnapshot,
      grow.getSnapshot
    ),
    topMax: extents[0],
  };
};
export const useMirrorGraphic = (
  node: ReactNode,
  layer: "grid" | "series" = "grid",
  offset = 0
) => {
  const { graphics } = useChart("MirrorAreaChart geometry");
  const id = useId();
  const order = useContext(MirrorOrderContext) + offset;
  useEffect(() => {
    graphics.set({ id, layer, node, order });
  }, [graphics, id, node, order, layer]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
};
