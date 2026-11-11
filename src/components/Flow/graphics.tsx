import { Canvas, View } from "@tarojs/components";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { GraphicSnapshot } from "../../primitives/canvas-graphics";
import { G, Path } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { EDGE_DASH, EDGE_MARCH_DURATION } from "./constants";
import { useFlow } from "./context";
import type { FlowEdgeDrawing } from "./edge-canvas";
import { flowEdgeGeometry } from "./edge-geometry";
import { useFlowEdgeCanvas } from "./use-edge-canvas";

export const FlowGraphics = () => {
  const {
    box,
    boxes,
    edges,
    handles,
    groupIds,
    connection,
    origin,
    translateX,
    translateY,
    zoom,
  } = useFlow("Flow");
  const x = useSyncExternalStore(
    translateX.subscribe,
    translateX.getSnapshot,
    translateX.getSnapshot
  );
  const y = useSyncExternalStore(
    translateY.subscribe,
    translateY.getSnapshot,
    translateY.getSnapshot
  );
  const scale = useSyncExternalStore(
    zoom.subscribe,
    zoom.getSnapshot,
    zoom.getSnapshot
  );
  const id = `panel-flow-edges-${useId().replaceAll(":", "")}`;
  const draft = useSyncExternalStore(
    connection.subscribe,
    connection.getSnapshot,
    connection.getSnapshot
  );
  const tint = useThemeToken("muted-foreground");
  const reduced = usePanelReducedMotion();
  const [clock, setClock] = useState(() => Date.now());
  const phases = useRef(new Map<string, number>());
  const animating = edges.some((edge) => edge.props.animated);
  useEffect(() => {
    if (reduced || !animating) {
      return;
    }
    const tick = () => {
      setClock(Date.now());
    };
    const timer = setInterval(tick, 16);
    return () => clearInterval(timer);
  }, [animating, reduced]);
  useEffect(() => {
    const active = new Set(
      edges.filter((edge) => edge.props.animated).map((edge) => edge.key)
    );
    for (const key of active) {
      if (!phases.current.has(key)) {
        phases.current.set(key, Date.now());
      }
    }
    for (const key of phases.current.keys()) {
      if (!active.has(key)) {
        phases.current.delete(key);
      }
    }
  }, [edges]);
  const groups = useMemo(() => new Set(groupIds), [groupIds]);
  const drawings: FlowEdgeDrawing[] = [];
  for (const edge of edges) {
    const shape = flowEdgeGeometry(edge.props, boxes, handles, groups, tint);
    if (!shape) continue;
    const offset =
      shape.animated && !reduced
        ? (-EDGE_DASH *
            2 *
            ((clock - (phases.current.get(edge.key) ?? clock)) %
              EDGE_MARCH_DURATION)) /
          EDGE_MARCH_DURATION
        : 0;
    drawings.push({
      ...shape,
      dash: shape.dashed ? [EDGE_DASH, EDGE_DASH] : [],
      offset,
    });
  }
  if (draft.active)
    drawings.push({
      d: `M${draft.x1},${draft.y1} L${draft.x2},${draft.y2}`,
      stroke: tint,
      width: 2,
      dash: [4, 4],
      offset: 0,
    });
  const ready = useFlowEdgeCanvas(id, {
    width: box.width,
    height: box.height,
    x,
    y,
    zoom: scale,
    drawings,
  });
  if (box.width <= 0 || box.height <= 0) return null;
  return (
    <View
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: `${(origin.x - x / scale) * 2}rpx`,
        top: `${(origin.y - y / scale) * 2}rpx`,
        width: `${box.width * 2}rpx`,
        height: `${box.height * 2}rpx`,
        transform: `scale(${1 / scale})`,
        transformOrigin: "0 0",
      }}
    >
      <Canvas
        id={id}
        type="2d"
        className="panel-flow-edges"
        style={{
          position: "absolute",
          inset: 0,
          width: `${box.width * 2}rpx`,
          height: `${box.height * 2}rpx`,
          pointerEvents: "none",
          opacity: ready ? 1 : 0,
        }}
      />
      {ready ? null : (
        <GraphicSnapshot
          width={box.width}
          height={box.height}
          viewBox={`0 0 ${box.width} ${box.height}`}
        >
          <G transform={`translate(${x} ${y}) scale(${scale})`}>
            {drawings.map((drawing, index) => (
              <G key={index}>
                <Path
                  d={drawing.d}
                  fill="none"
                  stroke={drawing.stroke}
                  strokeWidth={drawing.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  {...(drawing.dash.length
                    ? { strokeDasharray: drawing.dash.join(" ") }
                    : {})}
                  strokeDashoffset={drawing.offset}
                />
                {drawing.head ? (
                  <Path d={drawing.head} fill={drawing.stroke} />
                ) : null}
              </G>
            ))}
          </G>
        </GraphicSnapshot>
      )}
    </View>
  );
};
