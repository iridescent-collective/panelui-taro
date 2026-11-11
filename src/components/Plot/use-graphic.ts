import { cloneElement, useContext, useEffect, useId, useMemo } from "react";
import type { ReactNode } from "react";

import { ChartGraphicOrderContext, usePlot } from "./context";
import {
  PlotLayerRegistryContext,
  PlotLayerPathContext,
  PlotLayerAncestorsContext,
} from "./layer-store";

export const usePlotGraphic = (layer: "grid" | "series", node: ReactNode) => {
  const { graphics } = usePlot("Plot geometry");
  const id = useId();
  const order = useContext(ChartGraphicOrderContext);
  const store = useContext(PlotLayerRegistryContext);
  const path = useContext(PlotLayerPathContext);
  const parents = useContext(PlotLayerAncestorsContext);
  const wrapped = useMemo(() => {
    let result = node;
    for (let i = parents.length - 1; i >= 0; i -= 1) {
      result = cloneElement(parents[i], {}, result);
    }
    return result;
  }, [parents, node]);
  useEffect(() => {
    if (store) {
      store.set(id, node, path, parents);
    } else {
      graphics.set({ id, layer, node: wrapped, order });
    }
  }, [graphics, id, layer, node, wrapped, order, store, path, parents]);
  useEffect(
    () => () => {
      if (store) {
        store.remove(id);
      } else {
        graphics.remove(id);
      }
    },
    [graphics, id, store]
  );
};
export const PlotReferenceGraphic = ({ children }: { children: ReactNode }) => {
  usePlotGraphic("grid", children);
  return null;
};
