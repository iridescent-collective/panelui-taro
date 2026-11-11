import { View } from "@tarojs/components";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { cn } from "../../lib/utils";
import { Text, textChildren } from "../primitives/Text";
import { FlowGroupContext, useFlow } from "./context";
import type { FlowGroupProps, FlowNodePosition } from "./types";
import { useOwnedPan } from "./use-owned-pan";
import { collectNodeIds } from "./utils";

export const FlowGroup = ({
  id,
  position,
  size,
  label,
  className,
  draggable = true,
  children,
  ...props
}: FlowGroupProps) => {
  const flow = useFlow("Flow.Group");
  const {
    registerNode,
    unregisterNode,
    registerGroup,
    unregisterGroup,
    setNodeRect,
    dropNodeRect,
    onNodeDragEnd,
  } = flow;
  useEffect(() => {
    registerNode(id, label ?? id);
    registerGroup(id);
    return () => {
      unregisterNode(id);
      unregisterGroup(id);
    };
  }, [id, label, registerNode, unregisterNode, registerGroup, unregisterGroup]);
  useEffect(() => {
    setNodeRect(id, {
      height: size.height,
      width: size.width,
      x: position.x,
      y: position.y,
    });
    return () => dropNodeRect(id);
  }, [
    id,
    position.x,
    position.y,
    size.width,
    size.height,
    setNodeRect,
    dropNodeRect,
  ]);
  const ids = useMemo(() => collectNodeIds(children), [children]);
  const start = useRef<Record<string, FlowNodePosition>>({});
  const rects = useSyncExternalStore(
    flow.rects.subscribe,
    flow.rects.getSnapshot,
    flow.rects.getSnapshot
  );
  const zoom = useSyncExternalStore(
    flow.zoom.subscribe,
    flow.zoom.getSnapshot,
    flow.zoom.getSnapshot
  );
  const pan = useOwnedPan({
    begin: () => {
      const snapshot: Record<string, FlowNodePosition> = {};
      for (const key of [id, ...ids]) {
        const rect = flow.rects.value[key];
        if (rect) {
          snapshot[key] = { x: rect.x, y: rect.y };
        }
      }
      start.current = snapshot;
    },
    domain: id,
    enabled: draggable && !flow.locked,
    finish: () => {
      for (const key of Object.keys(start.current)) {
        const rect = flow.rects.value[key];
        if (rect) {
          onNodeDragEnd?.(key, { x: rect.x, y: rect.y });
        }
      }
    },
    update: (dx, dy) => {
      for (const [key, from] of Object.entries(start.current)) {
        if (flow.rects.value[key]) {
          setNodeRect(key, { x: from.x + dx, y: from.y + dy });
        }
      }
    },
    zoom,
  });
  const rect = rects[id];
  return (
    <FlowGroupContext.Provider value={id}>
      <View
        {...props}
        data-flow-group={id}
        className={cn(
          "absolute flex flex-col rounded-[var(--panel-radius-2xl)] border-[2px] border-dashed border-[var(--panel-border)] bg-[var(--panel-muted-opacity-25)]",
          className
        )}
        style={{
          height: `${size.height * 2}rpx`,
          left: 0,
          top: 0,
          transform: `translateX(${((rect?.x ?? 0) + flow.origin.x) * 2}rpx) translateY(${((rect?.y ?? 0) + flow.origin.y) * 2}rpx)`,
          width: `${size.width * 2}rpx`,
        }}
        aria-label={label ?? id}
        catchMove={draggable && !flow.locked}
        onTouchStart={pan.onTouchStart}
        onTouchMove={pan.onTouchMove}
        onTouchEnd={pan.onTouchEnd}
        onTouchCancel={pan.onTouchCancel}
      >
        {label ? (
          <Text
            size="xs"
            muted
            className="px-[24px] pt-[16px] tracking-wider uppercase"
          >
            {label}
          </Text>
        ) : null}
      </View>
      {textChildren(children)}
    </FlowGroupContext.Provider>
  );
};
