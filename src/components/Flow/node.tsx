import { View } from "@tarojs/components";
import { showActionSheet } from "@tarojs/taro";
import {
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

import { cn } from "../../lib/utils";
import { textChildren } from "../primitives/Text";
import { FlowNodeContext, FlowGroupContext, useFlow } from "./context";
import {
  clampNodePosition,
  moveNodePosition,
  FLOW_MOVE_ACTIONS,
  FLOW_DELETE_ACTION,
  getFlowConnectionActions,
} from "./flow-accessibility";
import type { FlowNodeProps, FlowNodePosition } from "./types";
import { useNodeSize } from "./use-node-size";
import { useOwnedPan } from "./use-owned-pan";

export const FlowNode = ({
  id,
  position,
  className,
  draggable = true,
  confine = false,
  pinned = false,
  selected = false,
  onPress,
  onDelete,
  accessibilityMoveStep = 24,
  accessibilityLabel,
  accessibilityActions,
  onAccessibilityAction,
  children,
  ...props
}: FlowNodeProps) => {
  const flow = useFlow("Flow.Node");
  const group = useContext(FlowGroupContext);
  const domId = `panel-flow-node-${useId().replaceAll(":", "")}`;
  const size = useNodeSize(children, domId);
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
  const {
    setNodeRect,
    dropNodeRect,
    registerNode,
    unregisterNode,
    onNodeDragEnd,
  } = flow;
  useEffect(() => {
    registerNode(id, accessibilityLabel ?? id);
    return () => unregisterNode(id);
  }, [id, accessibilityLabel, registerNode, unregisterNode]);
  const previous = useRef<(FlowNodePosition & { id: string }) | null>(null);
  useEffect(() => {
    if (
      previous.current?.id === id &&
      previous.current.x === position.x &&
      previous.current.y === position.y
    ) {
      return;
    }
    previous.current = { ...position, id };
    setNodeRect(id, { x: position.x, y: position.y });
  }, [id, position, setNodeRect]);
  useEffect(() => () => dropNodeRect(id), [id, dropNodeRect]);
  useEffect(() => {
    if (size && size.width > 0 && size.height > 0) {
      setNodeRect(id, { height: size.height, width: size.width });
    }
  }, [id, size?.width, size?.height, setNodeRect]);
  const movable = draggable && !pinned && !flow.locked;
  const start = useRef({ x: 0, y: 0 });
  const pan = useOwnedPan({
    begin: () => {
      const rect = flow.rects.value[id];
      start.current = { x: rect?.x ?? 0, y: rect?.y ?? 0 };
    },
    domain: id,
    enabled: movable,
    finish: () => {
      const rect = flow.rects.value[id];
      if (rect) {
        onNodeDragEnd?.(id, { x: rect.x, y: rect.y });
      }
    },
    tap: onPress,
    update: (dx, dy) => {
      const rect = flow.rects.value[id];
      if (!rect) {
        return;
      }
      const next = clampNodePosition(
        rect,
        confine && group ? flow.rects.value[group] : undefined,
        { x: start.current.x + dx, y: start.current.y + dy }
      );
      setNodeRect(id, next);
    },
    zoom,
  });
  const actions = useMemo(
    () => [
      ...(onPress ? [{ label: "Activate", name: "activate" }] : []),
      ...(movable ? FLOW_MOVE_ACTIONS : []),
      ...(flow.canConnect && !flow.locked
        ? getFlowConnectionActions(id, flow.nodes, flow.handles)
        : []),
      ...(onDelete ? [FLOW_DELETE_ACTION] : []),
      ...(accessibilityActions ?? []),
    ],
    [
      id,
      onPress,
      movable,
      flow.canConnect,
      flow.locked,
      flow.nodes,
      flow.handles,
      onDelete,
      accessibilityActions,
    ]
  );
  const latest = useRef({
    actions,
    confine,
    flow,
    group,
    id,
    movable,
    onAccessibilityAction,
    onDelete,
    onPress,
    step: accessibilityMoveStep,
  });
  latest.current = {
    actions,
    confine,
    flow,
    group,
    id,
    movable,
    onAccessibilityAction,
    onDelete,
    onPress,
    step: accessibilityMoveStep,
  };
  const mounted = useRef(true);
  const request = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current += 1;
    };
  }, []);
  const menu = async () => {
    pan.cancel();
    const snapshot = latest.current;
    const options = snapshot.actions;
    if (!options.length) {
      return;
    }
    request.current += 1;
    const version = request.current;
    const isCurrent = () =>
      mounted.current &&
      request.current === version &&
      latest.current.id === snapshot.id;
    try {
      const result = await showActionSheet({
        itemList: options.map((action) => action.label ?? action.name),
      });
      const { current } = latest;
      if (!isCurrent()) {
        return;
      }
      const action = options[result.tapIndex];
      if (
        !action ||
        !current.actions.some((entry) => entry.name === action.name)
      ) {
        return;
      }
      if (action.name === "activate") {
        current.onPress?.();
        return;
      }
      if (action.name === FLOW_DELETE_ACTION.name) {
        const remove =
          current.onDelete === snapshot.onDelete ? current.onDelete : undefined;
        remove?.();
        return;
      }
      const connection = getFlowConnectionActions(
        current.id,
        current.flow.nodes,
        current.flow.handles
      ).find((entry) => entry.name === action.name);
      if (connection) {
        current.flow.connectNodes(connection.connection);
        return;
      }
      if (current.movable) {
        const rect = current.flow.rects.value[current.id];
        if (rect) {
          const next = moveNodePosition(
            rect,
            current.confine && current.group
              ? current.flow.rects.value[current.group]
              : undefined,
            action.name,
            current.step
          );
          if (next) {
            current.flow.setNodeRect(current.id, next);
            current.flow.onNodeDragEnd?.(current.id, next);
            return;
          }
        }
      }
      current.onAccessibilityAction?.({
        nativeEvent: { actionName: action.name },
      });
    } catch {
      return false;
    }
  };
  const rect = rects[id];
  return (
    <FlowNodeContext.Provider value={id}>
      <View
        {...props}
        id={domId}
        data-flow-node={id}
        className={cn(
          "absolute flex flex-col",
          selected &&
            "rounded-[var(--panel-radius-3xl)] ring-[4px] ring-[var(--panel-ring)]",
          className
        )}
        style={{
          left: 0,
          top: 0,
          transform: `translateX(${((rect?.x ?? 0) + flow.origin.x) * 2}rpx) translateY(${((rect?.y ?? 0) + flow.origin.y) * 2}rpx)`,
        }}
        aria-role={onPress || actions.length ? "button" : "none"}
        aria-label={accessibilityLabel ?? id}
        aria-selected={selected}
        catchMove={movable}
        onTouchStart={pan.onTouchStart}
        onTouchMove={pan.onTouchMove}
        onTouchEnd={pan.onTouchEnd}
        onTouchCancel={pan.onTouchCancel}
        onLongPress={() => {
          void menu();
        }}
      >
        {textChildren(children)}
      </View>
    </FlowNodeContext.Provider>
  );
};
