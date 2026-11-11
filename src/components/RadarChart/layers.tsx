import { useSyncExternalStore } from "react";

import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { useChart } from "./context";

export const RadarGraphicLayer = () => {
  const { graphics, width, height } = useChart("RadarChart graphics");
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
