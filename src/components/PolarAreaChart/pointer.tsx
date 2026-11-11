import { Canvas } from "@tarojs/components";
import { useId, useMemo } from "react";

import { sortCopy } from "../../lib/sort-copy";
import { useCanvasTap } from "../../primitives/use-canvas-tap";
import { contoursContainPoint } from "../../primitives/wedge-hit";
import { useChart } from "./context";

export const PolarAreaChartPointer = () => {
  const { data, size, status, targets, activeIndex, setActiveIndex, origin } =
    useChart("PolarAreaChart pointer");
  const id = `panelui-polar-touch-${useId().replaceAll(":", "")}`;
  const resetKey = useMemo(
    () => ({ data, origin, size, status }),
    [data, size, status, origin]
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
      className="panel-polar-pointer absolute inset-0 h-full w-full"
      {...pointer}
    />
  );
};
