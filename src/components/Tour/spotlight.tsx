import { View } from "@tarojs/components";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSourceSpring } from "../../hooks/use-source-spring";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { useChartTween } from "../../primitives/chart-tween";
import { Path } from "../../primitives/static-svg";
import { TOUR_SPRING } from "./constants";
import { cutoutPath } from "./geometry";
import type { TourRect } from "./types";

export const TourSpotlight = ({
  spot,
  width,
  height,
  color,
}: {
  spot:
    | (TourRect & {
        radius: number;
      })
    | null;
  width: number;
  height: number;
  color: string;
}) => {
  const reduced = usePanelReducedMotion();
  const settled = useRef(false);
  const animate = settled.current && !reduced;
  const target = spot ?? { height: 0, radius: 0, width: 0, x: 0, y: 0 };
  const x = useSourceSpring(target.x, TOUR_SPRING, !animate, target.x);
  const y = useSourceSpring(target.y, TOUR_SPRING, !animate, target.y);
  const w = useSourceSpring(target.width, TOUR_SPRING, !animate, target.width);
  const h = useSourceSpring(
    target.height,
    TOUR_SPRING,
    !animate,
    target.height
  );
  const radius = useSourceSpring(
    target.radius,
    TOUR_SPRING,
    !animate,
    target.radius
  );
  useEffect(() => {
    settled.current = spot !== null;
  }, [spot]);
  const fade = useChartTween(reduced ? 1 : 0);
  useEffect(() => {
    fade.timingTo(1, reduced ? 0 : 180);
  }, [reduced, fade.timingTo]);
  const opacity = useSyncExternalStore(
    fade.signal.subscribe,
    fade.signal.getSnapshot,
    fade.signal.getSnapshot
  );
  return (
    <View
      aria-hidden
      className="fixed inset-0"
      style={{ opacity, pointerEvents: "none" }}
    >
      <CanvasGraphics
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <Path
          d={cutoutPath(width, height, x, y, w, h, radius)}
          fill={color}
          fillRule="evenodd"
        />
      </CanvasGraphics>
    </View>
  );
};
