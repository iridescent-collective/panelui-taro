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
  ScatterChartDatum,
  ScatterChartPoint,
  ScatterChartStatus,
} from "./types";

export interface ScatterContextValue {
  data: ScatterChartDatum[];
  xDataKey: string;
  plot: Plot;
  status: ScatterChartStatus;
  series: [string, string][];
  registerSeries: (key: string, color: string) => void;
  unregisterSeries: (key: string) => void;
  domains: ObservableValue<readonly number[]>;
  xExtent: [number, number];
  yExtent: [number, number];
  reveal: ObservableNumber;
  activePoint: ScatterChartPoint | null;
  setActivePoint: (point: ScatterChartPoint | null) => void;
  graphics: ChartGraphicsStore;
  width: number;
  height: number;
}
export const ScatterChartContext = createContext<ScatterContextValue | null>(
  null
);
export const ScatterOrderContext = createContext(0);
export const useChart = (part: string) => {
  const chart = useContext(ScatterChartContext);
  if (!chart) {
    throw new Error(`${part} must be used within a <ScatterChart>`);
  }
  return chart;
};
export const useScatterChart = () => {
  const { activePoint, xDataKey } = useChart("useScatterChart");
  return { activePoint, xDataKey };
};
export const useScatterFrame = () => {
  const { domains, reveal } = useChart("ScatterChart frame");
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
export const useScatterGraphic = (node: ReactNode, offset = 0) => {
  const { graphics } = useChart("ScatterChart geometry");
  const id = useId();
  const order = useContext(ScatterOrderContext) + offset;
  useEffect(() => {
    graphics.set({ id, layer: "grid", node, order });
  }, [graphics, id, node, order]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
};
