import { View } from "@tarojs/components";
import { useMemo, useSyncExternalStore } from "react";

import { CanvasGraphics } from "../../primitives/canvas-graphics";
import type { ObservableNumber } from "../../primitives/observable-number";
import { useChart } from "./context";

const GraphicImage = ({ layer }: { layer: "grid" | "series" }) => {
  const { graphics, width, height } = useChart("LineChart layer");
  const snapshot = useSyncExternalStore(
    graphics.subscribe,
    graphics.getSnapshot,
    graphics.getSnapshot
  );
  const children = useMemo(
    () =>
      snapshot
        .filter((graphic) => graphic.layer === layer)
        .map((graphic) => graphic.node),
    [snapshot, layer]
  );
  return (
    <CanvasGraphics
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {children}
    </CanvasGraphics>
  );
};
export const LineChartLayers = ({ reveal }: { reveal: ObservableNumber }) => {
  const { plot } = useChart("LineChart layers");
  const shown = useSyncExternalStore(
    reveal.subscribe,
    reveal.getSnapshot,
    reveal.getSnapshot
  );
  return (
    <>
      <View
        aria-hidden
        className="absolute inset-0"
        style={{ pointerEvents: "none" }}
      >
        <GraphicImage layer="grid" />
      </View>
      <View
        aria-hidden
        className="absolute top-0 bottom-0 overflow-hidden"
        style={{
          left: `${plot.left * 2}rpx`,
          pointerEvents: "none",
          width: `${plot.width * shown * 2}rpx`,
        }}
      >
        <View
          className="absolute top-0"
          style={{ left: `${-plot.left * 2}rpx` }}
        >
          <GraphicImage layer="series" />
        </View>
      </View>
    </>
  );
};
