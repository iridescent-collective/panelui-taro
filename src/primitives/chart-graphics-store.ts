import type { ReactNode } from "react";

import { sortCopy } from "../lib/sort-copy";
import { createObservableValue } from "./observable-value";

export interface ChartGraphic {
  id: string;
  layer: "grid" | "series";
  order: number;
  node: ReactNode;
}
export const createChartGraphicsStore = () => {
  const nodes = new Map<string, ChartGraphic>();
  const signal = createObservableValue<readonly ChartGraphic[]>([]);
  const publish = () => {
    signal.value = sortCopy(
      [...nodes.values()],
      (left, right) => left.order - right.order
    );
  };
  return {
    getSnapshot: signal.getSnapshot,
    remove: (id: string) => {
      if (nodes.delete(id)) {
        publish();
      }
    },
    set: (graphic: ChartGraphic) => {
      const current = nodes.get(graphic.id);
      if (
        current &&
        current.node === graphic.node &&
        current.order === graphic.order &&
        current.layer === graphic.layer
      ) {
        return;
      }
      nodes.set(graphic.id, graphic);
      publish();
    },
    subscribe: signal.subscribe,
  };
};
export type ChartGraphicsStore = ReturnType<typeof createChartGraphicsStore>;
