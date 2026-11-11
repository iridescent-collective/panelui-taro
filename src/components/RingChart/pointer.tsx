import { Canvas } from "@tarojs/components";
import { useId, useMemo } from "react";

import { sortCopy } from "../../lib/sort-copy";
import { useCanvasTap } from "../../primitives/use-canvas-tap";
import { useChart } from "./context";
import { ringContainsPoint } from "./math";

export const RingChartPointer = () => {
  const {
    data,
    size,
    strokeWidth,
    ringGap,
    startAngle,
    arc,
    targets,
    activeIndex,
    setActiveIndex,
  } = useChart("RingChart pointer");
  const id = `panelui-ring-touch-${useId().replaceAll(":", "")}`;
  const resetKey = useMemo(
    () => ({ arc, data, ringGap, size, startAngle, strokeWidth }),
    [data, size, strokeWidth, ringGap, startAngle, arc]
  );
  const pointer = useCanvasTap(
    (x, y) => {
      const ordered = sortCopy(
        [...targets.values()],
        (a, b) => b.order - a.order
      );
      return (
        ordered.find((item) =>
          ringContainsPoint(
            x,
            y,
            size,
            item.radius,
            strokeWidth,
            startAngle,
            arc
          )
        ) ?? null
      );
    },
    (target) => {
      if (targets.has(target.id) && data[target.index]) {
        setActiveIndex(activeIndex === target.index ? -1 : target.index);
      }
    },
    resetKey
  );
  return (
    <Canvas
      id={id}
      type="2d"
      aria-hidden
      className="panel-ring-pointer absolute inset-0 h-full w-full"
      {...pointer}
    />
  );
};
