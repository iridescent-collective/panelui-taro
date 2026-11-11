import { useContext, useEffect, useId } from "react";
import type { ReactNode } from "react";

import { PolarOrderContext, useChart } from "./context";

export const usePolarGraphic = (node: ReactNode, offset = 0) => {
  const { graphics } = useChart("PieChart geometry");
  const id = useId();
  const order = useContext(PolarOrderContext) + offset;
  useEffect(() => {
    graphics.set({ id, layer: "grid", node, order });
  }, [graphics, id, node, order]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
  return { id, order };
};
