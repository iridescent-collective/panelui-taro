import { useContext, useEffect, useId } from "react";
import type { ReactNode } from "react";

import { PieOrderContext, useChart } from "./context";

export const usePieGraphic = (node: ReactNode, offset = 0) => {
  const { graphics } = useChart("PieChart geometry");
  const id = useId();
  const order = useContext(PieOrderContext) + offset;
  useEffect(() => {
    graphics.set({ id, layer: "grid", node, order });
  }, [graphics, id, node, order]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
  return { id, order };
};
