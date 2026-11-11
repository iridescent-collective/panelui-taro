import { useContext, useEffect, useId } from "react";
import type { ReactNode } from "react";

import { RadarOrderContext, useChart } from "./context";

export const useRadarGraphic = (node: ReactNode) => {
  const { graphics } = useChart("RadarChart geometry");
  const id = useId();
  const order = useContext(RadarOrderContext);
  useEffect(() => {
    graphics.set({ id, layer: "grid", node, order });
  }, [graphics, id, node, order]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
};
export const RadarReferenceGraphic = ({
  children,
}: {
  children: ReactNode;
}) => {
  useRadarGraphic(children);
  return null;
};
