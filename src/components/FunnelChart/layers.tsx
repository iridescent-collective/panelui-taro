import { Canvas } from "@tarojs/components";
import { useId, useMemo, useSyncExternalStore } from "react";

import { sortCopy } from "../../lib/sort-copy";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { useCanvasTap } from "../../primitives/use-canvas-tap";
import { useChart } from "./context";

export const FunnelGraphicLayer = () => {
  const { graphics, width, height } = useChart("FunnelChart graphics");
  const snapshot = useSyncExternalStore(
    graphics.subscribe,
    graphics.getSnapshot,
    graphics.getSnapshot
  );
  return (
    <CanvasGraphics
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {snapshot.map((item) => item.node)}
    </CanvasGraphics>
  );
};
export const FunnelPointer = () => {
  const { data, bands, status, targets, activeIndex, setActiveIndex } =
    useChart("FunnelChart pointer");
  const id = `panel-funnel-touch-${useId().replaceAll(":", "")}`;
  const reset = useMemo(() => ({ bands, data, status }), [data, bands, status]);
  const pointer = useCanvasTap(
    (x, y) =>
      sortCopy([...targets.values()], (a, b) => b.order - a.order).find(
        (target) => target.hit(x, y)
      ) ?? null,
    (target) => {
      if (targets.has(target.id) && data[target.index]) {
        setActiveIndex(activeIndex === target.index ? -1 : target.index);
      }
    },
    reset
  );
  return status === "loading" ? null : (
    <Canvas
      id={id}
      type="2d"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      {...pointer}
    />
  );
};
