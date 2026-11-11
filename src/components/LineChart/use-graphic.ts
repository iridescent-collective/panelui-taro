import { useContext, useEffect, useId } from "react";
import type { ReactNode } from "react";

import { ChartGraphicOrderContext, useChart } from "./context";

export const useChartGraphic = (layer: "grid" | "series", node: ReactNode) => {
  const { graphics } = useChart("LineChart geometry");
  const id = useId();
  const order = useContext(ChartGraphicOrderContext);
  useEffect(() => {
    graphics.set({ id, layer, node, order });
  }, [graphics, id, layer, node, order]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
};
export const LineChartReferenceGraphic = ({
  children,
}: {
  children: ReactNode;
}) => {
  useChartGraphic("grid", children);
  return null;
};
