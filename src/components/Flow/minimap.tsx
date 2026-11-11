import { View } from "@tarojs/components";
import { useSyncExternalStore } from "react";

import { cn } from "../../lib/utils";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { Rect } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useFlow } from "./context";
import type { FlowRect } from "./flow-paths";
import type { FlowMiniMapProps } from "./types";
import { flowVariants } from "./variants";

const CORNERS = {
  "bottom-left": "bottom-[32px] left-[32px]",
  "bottom-right": "bottom-[160px] right-[32px]",
  "top-left": "left-[32px] top-[32px]",
  "top-right": "right-[32px] top-[32px]",
};
export const flowMapFit = (
  rects: Record<string, FlowRect>,
  width: number,
  height: number
) => {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const rect of Object.values(rects)) {
    if (rect.width === 0) {
      continue;
    }
    left = Math.min(left, rect.x);
    top = Math.min(top, rect.y);
    right = Math.max(right, rect.x + rect.width);
    bottom = Math.max(bottom, rect.y + rect.height);
  }
  if (!Number.isFinite(left)) {
    return { left: 0, scale: 1, top: 0 };
  }
  return {
    left,
    scale: Math.min(
      (width - 12) / Math.max(right - left, 200),
      (height - 12) / Math.max(bottom - top, 200),
      1
    ),
    top,
  };
};
export const FlowMiniMap = ({
  className,
  position = "bottom-right",
  width = 120,
  height = 84,
  nodeColor,
}: FlowMiniMapProps) => {
  const { rects, nodes, groupIds, translateX, translateY, zoom, box } =
    useFlow("Flow.MiniMap");
  const boxes = useSyncExternalStore(
    rects.subscribe,
    rects.getSnapshot,
    rects.getSnapshot
  );
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
  const muted = useThemeToken("muted-foreground");
  const ring = useThemeToken("ring");
  const outline = useThemeToken("border");
  const fit = flowMapFit(boxes, width, height);
  return (
    <View
      aria-label="Graph overview"
      className={cn(
        "pointer-events-none",
        flowVariants().minimap(),
        CORNERS[position],
        className
      )}
      style={{ height: `${height * 2}rpx`, width: `${width * 2}rpx` }}
    >
      <CanvasGraphics
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {nodes.map((node) => {
          const rect = boxes[node.id];
          if (!rect || rect.width === 0) {
            return null;
          }
          const group = groupIds.includes(node.id);
          return (
            <Rect
              key={node.id}
              data-flow-minimap-node={node.id}
              x={6 + (rect.x - fit.left) * fit.scale}
              y={6 + (rect.y - fit.top) * fit.scale}
              width={Math.min(Math.max(rect.width * fit.scale, 2), width)}
              height={Math.min(Math.max(rect.height * fit.scale, 2), height)}
              fill={group ? "none" : (nodeColor ?? muted)}
              {...(group ? { stroke: outline, strokeWidth: 1 } : {})}
              opacity={group ? 0.9 : 0.55}
              rx={group ? 2 : 1.5}
            />
          );
        })}
        <Rect
          x={box.width > 0 ? 6 + (-x / scale - fit.left) * fit.scale : 0}
          y={box.width > 0 ? 6 + (-y / scale - fit.top) * fit.scale : 0}
          width={
            box.width > 0 ? Math.min((box.width / scale) * fit.scale, width) : 0
          }
          height={
            box.width > 0
              ? Math.min((box.height / scale) * fit.scale, height)
              : 0
          }
          fill="none"
          stroke={ring}
          strokeWidth={1}
          rx={2}
        />
      </CanvasGraphics>
    </View>
  );
};
FlowMiniMap.slot = "overlay" as const;
