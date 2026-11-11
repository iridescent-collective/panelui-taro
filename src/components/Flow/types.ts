import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { FlowAccessibilityHandle } from "./flow-accessibility";
import type { FlowEndpointReference } from "./flow-identifiers";
import type { FlowSide } from "./flow-paths";

export interface FlowAccessibilityActionEvent {
  nativeEvent: {
    actionName: string;
  };
}
export type FlowViewProps = ComponentProps<typeof View> & {
  accessibilityActions?: readonly {
    name: string;
    label?: string;
  }[];
  onAccessibilityAction?: (event: FlowAccessibilityActionEvent) => void;
};
export type FlowEdgeVariant = "bezier" | "smoothstep" | "step" | "straight";
export interface FlowViewport {
  x: number;
  y: number;
  zoom: number;
}
export interface FlowNodePosition {
  x: number;
  y: number;
}
export interface FlowConnection {
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
}
export interface HandleEntry extends FlowAccessibilityHandle {
  side: FlowSide;
  offset: number;
}
export interface FlowProps extends Omit<FlowViewProps, "children"> {
  className?: string;
  defaultViewport?: FlowViewport;
  minZoom?: number;
  maxZoom?: number;
  panOnDrag?: boolean;
  zoomOnPinch?: boolean;
  fitViewOnMount?: boolean;
  fitViewPadding?: number;
  onViewportChange?: (viewport: FlowViewport) => void;
  onNodeDragEnd?: (id: string, position: FlowNodePosition) => void;
  onConnect?: (connection: FlowConnection) => void;
  isValidConnection?: (connection: FlowConnection) => boolean;
  children?: ReactNode;
}
export interface FlowBackgroundProps {
  variant?: "dots" | "lines" | "cross" | "none";
  gap?: number;
  size?: number;
  color?: string;
}
export interface FlowNodeProps extends Omit<FlowViewProps, "children"> {
  id: string;
  position: FlowNodePosition;
  className?: string;
  draggable?: boolean;
  confine?: boolean;
  pinned?: boolean;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  accessibilityMoveStep?: number;
  accessibilityLabel?: string;
  children?: ReactNode;
}
export interface FlowHandleProps {
  id?: string;
  position?: FlowSide;
  type?: "source" | "target" | "both";
  offset?: number;
  className?: string;
  accessibilityLabel?: string;
  hidden?: boolean;
}
export interface FlowEdgeProps {
  from: FlowEndpointReference;
  to: FlowEndpointReference;
  variant?: FlowEdgeVariant;
  animated?: boolean;
  dashed?: boolean;
  color?: string;
  width?: number;
  arrow?: boolean;
  fromSide?: FlowSide;
  toSide?: FlowSide;
  radius?: number;
  gap?: number;
  curvature?: number;
}
export interface FlowGroupProps extends Omit<FlowViewProps, "children"> {
  id: string;
  position: FlowNodePosition;
  size: {
    width: number;
    height: number;
  };
  label?: string;
  className?: string;
  draggable?: boolean;
  children?: ReactNode;
}
export interface FlowControlsProps {
  className?: string;
  zoom?: boolean;
  fit?: boolean;
  lock?: boolean;
  step?: number;
}
export interface FlowMiniMapProps {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  width?: number;
  height?: number;
  nodeColor?: string;
}
