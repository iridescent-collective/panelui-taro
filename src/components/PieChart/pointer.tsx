import { Canvas } from "@tarojs/components";
import { useId, useMemo } from "react";

import { sortCopy } from "../../lib/sort-copy";
import { useCanvasTap } from "../../primitives/use-canvas-tap";
import { contoursContainPoint } from "../../primitives/wedge-hit";
import { useChart } from "./context";

export const PieChartPointer = () => {
  const {
    data,
    size,
    status,
    targets,
    activeIndex,
    setActiveIndex,
    origin,
    span,
  } = useChart("PieChart pointer");
  const id = `panelui-pie-touch-${useId().replaceAll(":", "")}`;
  const resetKey = useMemo(
    () => ({ data, origin, size, span, status }),
    [data, size, status, origin, span]
  );
  const pointer = useCanvasTap(
    (x, y) => {
      const ordered = sortCopy(
        [...targets.values()],
        (a, b) => b.order - a.order
      );
      return (
        ordered.find((target) => contoursContainPoint(target.contours, x, y)) ??
        null
      );
    },
    (target) => {
      if (targets.has(target.id) && data[target.index]) {
        setActiveIndex(activeIndex === target.index ? -1 : target.index);
      }
    },
    resetKey
  );
  return status === "loading" ? null : (
    <Canvas
      id={id}
      type="2d"
      aria-hidden
      className="panel-pie-pointer absolute inset-0 h-full w-full"
      {...pointer}
    />
  );
};
