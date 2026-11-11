import { createContext, useContext, useSyncExternalStore } from "react";

import type { ChartGraphicsStore } from "../../primitives/chart-graphics-store";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { ObservableValue } from "../../primitives/observable-value";
import type { PlotGeometry, PlotCurve } from "./types";

export interface PlotContextValue extends PlotGeometry {
  width: number;
  height: number;
  curve: PlotCurve;
  domain: ObservableValue<readonly [number, number]>;
  graphics: ChartGraphicsStore;
}
export const domainNumber = (
  domain: ObservableValue<readonly [number, number]>,
  index: 0 | 1
): ObservableNumber => ({
  getSnapshot: () => domain.value[index],
  subscribe: domain.subscribe,
  get value() {
    return domain.value[index];
  },
  set value(value: number) {
    const next: [number, number] = [...domain.value];
    next[index] = value;
    domain.value = next;
  },
});
export const PlotContext = createContext<PlotContextValue | null>(null);
export const ChartGraphicOrderContext = createContext(0);
export const usePlot = (component: string) => {
  const context = useContext(PlotContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Plot>`);
  }
  return context;
};
export const usePlotDomain = () => {
  const { domain } = usePlot("Plot domain");
  return useSyncExternalStore(
    domain.subscribe,
    domain.getSnapshot,
    domain.getSnapshot
  );
};
export const usePlotGeometry = () => usePlot("usePlot");

export const usePlotCursor = () => {
  const ctx = usePlot("usePlotCursor");
  return {
    activeIndex: ctx.activeIndexJS,
    activePoint:
      ctx.activeIndexJS >= 0 ? (ctx.data[ctx.activeIndexJS] ?? null) : null,
  };
};
