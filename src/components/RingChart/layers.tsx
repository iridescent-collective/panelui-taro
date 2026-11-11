import { useSyncExternalStore } from "react";

import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { useChart } from "./context";

export const RingGraphicLayer = () => {
  const { graphics, size } = useChart("RingChart graphics");
  const snapshot = useSyncExternalStore(
    graphics.subscribe,
    graphics.getSnapshot,
    graphics.getSnapshot
  );
  return (
    <CanvasGraphics width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {snapshot.map((entry) => entry.node)}
    </CanvasGraphics>
  );
};
