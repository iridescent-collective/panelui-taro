import { GROUP_EDGE_STANDOFF } from "./constants";
import {
  anchorOf,
  arrivalDirection,
  arrowHeadPath,
  autoSides,
  edgePath,
  standOff,
} from "./flow-paths";
import type { FlowRect } from "./flow-paths";
import type { FlowEdgeProps, HandleEntry } from "./types";
import { resolveEnd } from "./utils";

export const flowEdgeGeometry = (
  {
    from,
    to,
    variant = "bezier",
    animated = false,
    dashed = false,
    color,
    width = 2,
    arrow = false,
    fromSide,
    toSide,
    radius = 8,
    gap = 20,
    curvature = 0.25,
  }: FlowEdgeProps,
  boxes: Record<string, FlowRect>,
  handles: HandleEntry[],
  groups: Set<string>,
  tint: string
) => {
  const nodes = Object.keys(boxes);
  const source = resolveEnd(from, fromSide, nodes, handles);
  const target = resolveEnd(to, toSide, nodes, handles);
  const aRect = boxes[source.node];
  const bRect = boxes[target.node];
  if (!aRect || !bRect || aRect.width === 0 || bRect.width === 0) {
    return null;
  }
  const auto = autoSides(aRect, bRect);
  const aSide = source.side ?? auto.from;
  const bSide = target.side ?? auto.to;
  const a = standOff(
    anchorOf(aRect, aSide, source.offset),
    aSide,
    groups.has(source.node) ? GROUP_EDGE_STANDOFF : 0
  );
  const b = standOff(
    anchorOf(bRect, bSide, target.offset),
    bSide,
    groups.has(target.node) ? GROUP_EDGE_STANDOFF : 0
  );
  const d = edgePath(variant, a, aSide, b, bSide, curvature, radius, gap);
  let head: string | null = null;
  if (arrow) {
    const direction = arrivalDirection(variant, a, b, bSide);
    head = arrowHeadPath(b, direction.x, direction.y, Math.max(width * 3.5, 7));
  }
  return {
    animated,
    d,
    dashed: dashed || animated,
    head,
    stroke: color ?? tint,
    width,
  };
};
