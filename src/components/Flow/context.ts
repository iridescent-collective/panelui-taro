import { createContext, useContext } from "react";

import type { ObservableValue } from "../../primitives/observable-value";
import type { FlowAccessibilityNode } from "./flow-accessibility";
import type { FlowRect } from "./flow-paths";
import type {
  FlowEdgeProps,
  FlowConnection,
  FlowNodePosition,
  HandleEntry,
} from "./types";

export interface FlowContextValue {
  rects: ObservableValue<Record<string, FlowRect>>;
  boxes: Record<string, FlowRect>;
  setNodeRect: (id: string, rect: Partial<FlowRect>) => void;
  dropNodeRect: (id: string) => void;
  translateX: ObservableValue<number>;
  translateY: ObservableValue<number>;
  zoom: ObservableValue<number>;
  connection: ObservableValue<{
    active: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }>;
  size: ObservableValue<{
    width: number;
    height: number;
  }>;
  box: {
    width: number;
    height: number;
  };
  layer: {
    width: number;
    height: number;
  };
  origin: {
    x: number;
    y: number;
  };
  minZoom: number;
  maxZoom: number;
  locked: boolean;
  setLocked: (locked: boolean) => void;
  nodes: FlowAccessibilityNode[];
  groupIds: string[];
  handles: HandleEntry[];
  edges: {
    key: string;
    props: FlowEdgeProps;
  }[];
  registerNode: (id: string, label?: string) => void;
  unregisterNode: (id: string) => void;
  registerGroup: (id: string) => void;
  unregisterGroup: (id: string) => void;
  registerHandle: (entry: HandleEntry) => void;
  unregisterHandle: (key: string) => void;
  registerEdge: (key: string, props: FlowEdgeProps) => void;
  unregisterEdge: (key: string) => void;
  connectNodes: (connection: FlowConnection) => void;
  canConnect: boolean;
  onNodeDragEnd?: (id: string, position: FlowNodePosition) => void;
  fitView: () => void;
  zoomBy: (factor: number) => void;
}
export const FlowContext = createContext<FlowContextValue | null>(null);
export const useFlow = (component: string): FlowContextValue => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Flow>`);
  }
  return context;
};
export const FlowGroupContext = createContext<string | null>(null);
export const FlowNodeContext = createContext<string | null>(null);
