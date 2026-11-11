import type { FlowRect } from "./flow-paths";
import type { FlowConnection, FlowNodePosition } from "./types";

export const FLOW_MOVE_ACTIONS = [
  { dx: 0, dy: -1, label: "Move up", name: "flow-move-up" },
  { dx: 1, dy: 0, label: "Move right", name: "flow-move-right" },
  { dx: 0, dy: 1, label: "Move down", name: "flow-move-down" },
  { dx: -1, dy: 0, label: "Move left", name: "flow-move-left" },
] as const;
export const FLOW_DELETE_ACTION = {
  label: "Delete node",
  name: "flow-delete",
} as const;
export interface FlowAccessibilityNode {
  id: string;
  label: string;
}
export interface FlowAccessibilityHandle {
  key: string;
  node: string;
  id: string;
  label: string;
  type: "source" | "target" | "both";
}
export interface FlowConnectionAction {
  name: string;
  label: string;
  connection: FlowConnection;
}
export const flowConnectionActionName = (
  source: {
    node: string;
    handle?: string;
  },
  target: {
    node: string;
    handle?: string;
  }
): string => `flow-connect:${JSON.stringify([source, target])}`;
export const clampNodePosition = (
  rect: FlowRect,
  bounds: FlowRect | undefined,
  position: FlowNodePosition
): FlowNodePosition => {
  if (!bounds) {
    return position;
  }
  return {
    x: Math.min(
      Math.max(position.x, bounds.x),
      bounds.x + bounds.width - rect.width
    ),
    y: Math.min(
      Math.max(position.y, bounds.y),
      bounds.y + bounds.height - rect.height
    ),
  };
};
export const moveNodePosition = (
  rect: FlowRect,
  bounds: FlowRect | undefined,
  actionName: string,
  step: number
): FlowNodePosition | undefined => {
  const action = FLOW_MOVE_ACTIONS.find((entry) => entry.name === actionName);
  if (!action) {
    return undefined;
  }
  return clampNodePosition(rect, bounds, {
    x: rect.x + action.dx * Math.max(1, step),
    y: rect.y + action.dy * Math.max(1, step),
  });
};
export const getFlowConnectionActions = (
  sourceNode: string,
  nodes: FlowAccessibilityNode[],
  handles: FlowAccessibilityHandle[]
): FlowConnectionAction[] => {
  const sources = handles.filter(
    (handle) => handle.node === sourceNode && handle.type !== "target"
  );
  if (sources.length === 0) {
    return [];
  }
  const actions: FlowConnectionAction[] = [];
  for (const source of sources) {
    for (const targetNode of nodes) {
      if (targetNode.id === sourceNode) {
        continue;
      }
      const targets = handles.filter(
        (handle) => handle.node === targetNode.id && handle.type !== "source"
      );
      if (targets.length === 0) {
        actions.push({
          connection: {
            source: sourceNode,
            sourceHandle: source.id,
            target: targetNode.id,
          },
          label: `Connect ${source.label} to ${targetNode.label}`,
          name: flowConnectionActionName(
            { handle: source.id, node: source.node },
            { node: targetNode.id }
          ),
        });
        continue;
      }
      for (const target of targets) {
        actions.push({
          connection: {
            source: sourceNode,
            sourceHandle: source.id,
            target: target.node,
            targetHandle: target.id,
          },
          label: `Connect ${source.label} to ${targetNode.label}, ${target.label}`,
          name: flowConnectionActionName(
            { handle: source.id, node: source.node },
            { handle: target.id, node: target.node }
          ),
        });
      }
    }
  }
  return actions;
};
