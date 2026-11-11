export type FlowSide = "top" | "right" | "bottom" | "left";
export interface FlowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface FlowPoint {
  x: number;
  y: number;
}
export const sideNormal = (side: FlowSide): FlowPoint => {
  if (side === "left") {
    return { x: -1, y: 0 };
  }
  if (side === "right") {
    return { x: 1, y: 0 };
  }
  if (side === "top") {
    return { x: 0, y: -1 };
  }
  return { x: 0, y: 1 };
};
export const anchorOf = (
  rect: FlowRect,
  side: FlowSide,
  offset: number
): FlowPoint => {
  if (side === "top") {
    return { x: rect.x + rect.width * offset, y: rect.y };
  }
  if (side === "bottom") {
    return { x: rect.x + rect.width * offset, y: rect.y + rect.height };
  }
  if (side === "left") {
    return { x: rect.x, y: rect.y + rect.height * offset };
  }
  return { x: rect.x + rect.width, y: rect.y + rect.height * offset };
};
export const standOff = (
  point: FlowPoint,
  side: FlowSide,
  by: number
): FlowPoint => {
  if (by === 0) {
    return point;
  }
  const normal = sideNormal(side);
  return { x: point.x + normal.x * by, y: point.y + normal.y * by };
};
export const autoSides = (
  from: FlowRect,
  to: FlowRect
): {
  from: FlowSide;
  to: FlowSide;
} => {
  const dx = to.x + to.width / 2 - (from.x + from.width / 2);
  const dy = to.y + to.height / 2 - (from.y + from.height / 2);
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx >= 0
      ? { from: "right", to: "left" }
      : { from: "left", to: "right" };
  }
  return dy >= 0
    ? { from: "bottom", to: "top" }
    : { from: "top", to: "bottom" };
};
export const straightPath = (from: FlowPoint, to: FlowPoint): string =>
  `M${from.x},${from.y} L${to.x},${to.y}`;
const controlOffset = (distance: number, curvature: number): number => {
  if (distance >= 0) {
    return 0.5 * distance;
  }
  return curvature * 25 * Math.sqrt(-distance);
};
const controlPoint = (
  point: FlowPoint,
  side: FlowSide,
  other: FlowPoint,
  curvature: number
): FlowPoint => {
  if (side === "left") {
    return {
      x: point.x - controlOffset(point.x - other.x, curvature),
      y: point.y,
    };
  }
  if (side === "right") {
    return {
      x: point.x + controlOffset(other.x - point.x, curvature),
      y: point.y,
    };
  }
  if (side === "top") {
    return {
      x: point.x,
      y: point.y - controlOffset(point.y - other.y, curvature),
    };
  }
  return {
    x: point.x,
    y: point.y + controlOffset(other.y - point.y, curvature),
  };
};
export const bezierPath = (
  from: FlowPoint,
  fromSide: FlowSide,
  to: FlowPoint,
  toSide: FlowSide,
  curvature: number
): string => {
  const c1 = controlPoint(from, fromSide, to, curvature);
  const c2 = controlPoint(to, toSide, from, curvature);
  return `M${from.x},${from.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${to.x},${to.y}`;
};
const distanceBetween = (a: FlowPoint, b: FlowPoint): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
};
const bend = (
  a: FlowPoint,
  b: FlowPoint,
  c: FlowPoint,
  radius: number
): string => {
  const size = Math.min(
    distanceBetween(a, b) / 2,
    distanceBetween(b, c) / 2,
    radius
  );
  if ((a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y)) {
    return `L${b.x},${b.y}`;
  }
  if (a.y === b.y) {
    const xDir = a.x < c.x ? -1 : 1;
    const yDir = a.y < c.y ? 1 : -1;
    return `L${b.x + size * xDir},${b.y}Q${b.x},${b.y} ${b.x},${b.y + size * yDir}`;
  }
  const xDir = a.x < c.x ? 1 : -1;
  const yDir = a.y < c.y ? -1 : 1;
  return `L${b.x},${b.y + size * yDir}Q${b.x},${b.y} ${b.x + size * xDir},${b.y}`;
};
const roundedRoute = (
  points: FlowPoint[],
  from: FlowPoint,
  radius: number
): string => {
  const route: FlowPoint[] = [];
  for (const point of points) {
    const previous = route.at(-1);
    if (previous && previous.x === point.x && previous.y === point.y) {
      continue;
    }
    route.push(point);
  }
  if (route.length < 2) {
    return `M${from.x},${from.y}`;
  }
  const [first] = route;
  if (!first) {
    return `M${from.x},${from.y}`;
  }
  let d = `M${first.x},${first.y}`;
  for (let i = 1; i < route.length - 1; i += 1) {
    const previous = route[i - 1];
    const point = route[i];
    const next = route[i + 1];
    if (!previous || !point || !next) {
      continue;
    }
    d +=
      radius > 0
        ? bend(previous, point, next, radius)
        : `L${point.x},${point.y}`;
  }
  const last = route.at(-1);
  if (!last) {
    return d;
  }
  d += `L${last.x},${last.y}`;
  return d;
};
export const smoothStepPath = (
  from: FlowPoint,
  fromSide: FlowSide,
  to: FlowPoint,
  toSide: FlowSide,
  radius: number,
  gap: number
): string => {
  const fromNormal = sideNormal(fromSide);
  const toNormal = sideNormal(toSide);
  let fromGap = {
    x: from.x + fromNormal.x * gap,
    y: from.y + fromNormal.y * gap,
  };
  let toGap = { x: to.x + toNormal.x * gap, y: to.y + toNormal.y * gap };
  const horizontal =
    Math.abs(toGap.x - fromGap.x) > Math.abs(toGap.y - fromGap.y);
  const facing =
    (fromNormal.x !== 0 && toNormal.x !== 0 && fromNormal.x !== toNormal.x) ||
    (fromNormal.y !== 0 && toNormal.y !== 0 && fromNormal.y !== toNormal.y);
  let middle: FlowPoint[];
  if (facing) {
    const midX = (fromGap.x + toGap.x) / 2;
    const midY = (fromGap.y + toGap.y) / 2;
    middle =
      fromNormal.x === 0
        ? [
            { x: fromGap.x, y: midY },
            { x: toGap.x, y: midY },
          ]
        : [
            { x: midX, y: fromGap.y },
            { x: midX, y: toGap.y },
          ];
  } else {
    middle = horizontal
      ? [{ x: toGap.x, y: fromGap.y }]
      : [{ x: fromGap.x, y: toGap.y }];
    if (fromSide === toSide) {
      const axis = fromNormal.x === 0 ? "y" : "x";
      const apart = Math.abs(from[axis] - to[axis]);
      if (apart <= gap) {
        const push = Math.min(gap - 1, gap - apart);
        if (axis === "x") {
          fromGap = { x: fromGap.x + fromNormal.x * push, y: fromGap.y };
          toGap = { x: toGap.x + toNormal.x * push, y: toGap.y };
          middle = [{ x: Math.max(fromGap.x, toGap.x), y: fromGap.y }];
        } else {
          fromGap = { x: fromGap.x, y: fromGap.y + fromNormal.y * push };
          toGap = { x: toGap.x, y: toGap.y + toNormal.y * push };
          middle = [{ x: fromGap.x, y: Math.max(fromGap.y, toGap.y) }];
        }
      }
    }
  }
  return roundedRoute([from, fromGap, ...middle, toGap, to], from, radius);
};
export const edgePath = (
  variant: "bezier" | "smoothstep" | "step" | "straight",
  from: FlowPoint,
  fromSide: FlowSide,
  to: FlowPoint,
  toSide: FlowSide,
  curvature: number,
  radius: number,
  gap: number
): string => {
  if (variant === "straight") {
    return straightPath(from, to);
  }
  if (variant === "bezier") {
    return bezierPath(from, fromSide, to, toSide, curvature);
  }
  return smoothStepPath(
    from,
    fromSide,
    to,
    toSide,
    variant === "step" ? 0 : radius,
    gap
  );
};
export const edgeSpan = (from: FlowPoint, to: FlowPoint): number =>
  distanceBetween(from, to);
export const arrowHeadPath = (
  tip: FlowPoint,
  dirX: number,
  dirY: number,
  size: number
): string => {
  const length = Math.hypot(dirX, dirY) || 1;
  const ux = dirX / length;
  const uy = dirY / length;
  const px = -uy;
  const py = ux;
  const baseX = tip.x - ux * size;
  const baseY = tip.y - uy * size;
  const half = size * 0.45;
  return (
    `M${tip.x},${tip.y} ` +
    `L${baseX + px * half},${baseY + py * half} ` +
    `L${baseX - px * half},${baseY - py * half} Z`
  );
};
export const arrivalDirection = (
  variant: "bezier" | "smoothstep" | "step" | "straight",
  from: FlowPoint,
  to: FlowPoint,
  toSide: FlowSide
): {
  x: number;
  y: number;
} => {
  if (variant === "straight") {
    return { x: to.x - from.x, y: to.y - from.y };
  }
  const normal = sideNormal(toSide);
  return { x: -normal.x, y: -normal.y };
};
