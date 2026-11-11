import { useContext, useEffect, useId } from "react";
import type { ReactNode } from "react";

import { FunnelOrderContext, useChart } from "./context";

export const useFunnelGraphic = (node: ReactNode, offset = 0) => {
  const { graphics } = useChart("FunnelChart geometry");
  const id = useId();
  const order = useContext(FunnelOrderContext) + offset;
  useEffect(() => {
    graphics.set({ id, layer: "grid", node, order });
  }, [graphics, id, node, order]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
  return { id, order };
};
