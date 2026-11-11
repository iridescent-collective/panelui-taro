import { View } from "@tarojs/components";
import { useContext, useEffect, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";

import { FlowNodeContext, useFlow } from "./context";
import { encodeFlowHandleKey } from "./flow-identifiers";
import { anchorOf } from "./flow-paths";
import { findFlowTarget } from "./geometry";
import type { FlowHandleProps } from "./types";
import { useOwnedPan } from "./use-owned-pan";
import { flowVariants } from "./variants";

export const FlowHandle = ({
  id = "default",
  position = "right",
  type = "both",
  offset = 0.5,
  className,
  accessibilityLabel,
  hidden = false,
}: FlowHandleProps) => {
  const flow = useFlow("Flow.Handle");
  const node = useContext(FlowNodeContext);
  if (!node) {
    throw new Error("Flow.Handle must be used within a <Flow.Node>");
  }
  const key = encodeFlowHandleKey(node, id);
  const { registerHandle, unregisterHandle } = flow;
  useEffect(() => {
    registerHandle({
      id,
      key,
      label: accessibilityLabel ?? id,
      node,
      offset,
      side: position,
      type,
    });
    return () => unregisterHandle(key);
  }, [
    accessibilityLabel,
    id,
    key,
    node,
    offset,
    position,
    registerHandle,
    type,
    unregisterHandle,
  ]);
  const zoom = useSyncExternalStore(
    flow.zoom.subscribe,
    flow.zoom.getSnapshot,
    flow.zoom.getSnapshot
  );
  const clear = () => {
    flow.connection.value = { active: 0, x1: 0, x2: 0, y1: 0, y2: 0 };
  };
  const pan = useOwnedPan({
    begin: () => {
      const rect = flow.rects.value[node];
      if (!rect) {
        return;
      }
      const anchor = anchorOf(rect, position, offset);
      flow.connection.value = {
        active: 1,
        x1: anchor.x,
        x2: anchor.x,
        y1: anchor.y,
        y2: anchor.y,
      };
    },
    cancel: clear,
    domain: key,
    enabled: !flow.locked && type !== "target",
    finish: () => {
      const current = flow.connection.value;
      clear();
      if (current.active === 0) {
        return;
      }
      const target = findFlowTarget(
        node,
        { x: current.x2, y: current.y2 },
        flow.zoom.value,
        flow.rects.value,
        flow.handles
      );
      if (target) {
        flow.connectNodes({
          source: node,
          sourceHandle: id,
          target: target.node,
          targetHandle: target.handle,
        });
      }
    },
    tap: clear,
    update: (dx, dy) => {
      const current = flow.connection.value;
      if (current.active === 0) {
        return;
      }
      flow.connection.value = {
        ...current,
        x2: current.x1 + dx,
        y2: current.y1 + dy,
      };
    },
    zoom,
  });
  if (hidden) {
    return null;
  }
  const along = `${offset * 100}%`;
  let placement: CSSProperties = {
    marginTop: "-14rpx",
    right: "-14rpx",
    top: along,
  };
  if (position === "top") {
    placement = { left: along, marginLeft: "-14rpx", top: "-14rpx" };
  } else if (position === "bottom") {
    placement = { bottom: "-14rpx", left: along, marginLeft: "-14rpx" };
  } else if (position === "left") {
    placement = { left: "-14rpx", marginTop: "-14rpx", top: along };
  }
  return (
    <View
      aria-hidden
      data-flow-handle={key}
      className={flowVariants().handle({ className })}
      style={placement}
      catchMove={!flow.locked && type !== "target"}
      onTouchStart={pan.onTouchStart}
      onTouchMove={pan.onTouchMove}
      onTouchEnd={pan.onTouchEnd}
      onTouchCancel={pan.onTouchCancel}
    >
      <View className="absolute" style={{ inset: "-24rpx" }} />
    </View>
  );
};
