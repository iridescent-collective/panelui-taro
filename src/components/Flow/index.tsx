import { FlowBackground } from "./background";
import { FlowControls } from "./controls";
import { FlowEdge } from "./edge";
import { FlowGroup } from "./group";
import { FlowHandle } from "./handle";
import { FlowMiniMap } from "./minimap";
import { FlowNode } from "./node";
import { FlowRoot } from "./root";

export type {
  FlowEdgeVariant,
  FlowViewport,
  FlowNodePosition,
  FlowConnection,
  FlowProps,
  FlowBackgroundProps,
  FlowNodeProps,
  FlowHandleProps,
  FlowEdgeProps,
  FlowGroupProps,
  FlowControlsProps,
  FlowMiniMapProps,
} from "./types";
export type { FlowEndpoint, FlowEndpointReference } from "./flow-identifiers";
export type { FlowSide, FlowRect, FlowPoint } from "./flow-paths";
export const Flow = Object.assign(FlowRoot, {
  Background: FlowBackground,
  Controls: FlowControls,
  Edge: FlowEdge,
  Group: FlowGroup,
  Handle: FlowHandle,
  MiniMap: FlowMiniMap,
  Node: FlowNode,
});
