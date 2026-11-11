export interface PathPoint {
  x: number;
  y: number;
}
export interface WedgeHitShape {
  cx: number;
  cy: number;
  outer: number;
  inner: number;
  from: number;
  to: number;
  corner: number;
}
const HIT_TOLERANCE = 0.1;
const MAX_COORDINATE = 1_000_000;
const MAX_SEGMENTS = 4096;
const at = (shape: WedgeHitShape, turn: number, radius: number): PathPoint => {
  const angle = (turn - 0.25) * Math.PI * 2;
  return {
    x: shape.cx + radius * Math.cos(angle),
    y: shape.cy + radius * Math.sin(angle),
  };
};
const appendArc = (
  points: PathPoint[],
  shape: WedgeHitShape,
  radius: number,
  from: number,
  to: number
) => {
  const delta = (to - from) * Math.PI * 2;
  const step = 2 * Math.acos(Math.max(-1, 1 - HIT_TOLERANCE / radius));
  const segments = Math.min(
    MAX_SEGMENTS,
    Math.max(1, Math.ceil(Math.abs(delta) / step))
  );
  for (let index = 1; index <= segments; index += 1) {
    points.push(at(shape, from + ((to - from) * index) / segments, radius));
  }
};
const appendQuadratic = (
  points: PathPoint[],
  control: PathPoint,
  end: PathPoint
) => {
  const start = points.at(-1);
  if (!start) {
    points.push(end);
    return;
  }
  const curvature = Math.hypot(
    start.x - 2 * control.x + end.x,
    start.y - 2 * control.y + end.y
  );
  const segments = Math.min(
    MAX_SEGMENTS,
    Math.max(1, Math.ceil(Math.sqrt(curvature / (4 * HIT_TOLERANCE))))
  );
  for (let index = 1; index <= segments; index += 1) {
    const t = index / segments;
    const v = 1 - t;
    points.push({
      x: v * v * start.x + 2 * v * t * control.x + t * t * end.x,
      y: v * v * start.y + 2 * v * t * control.y + t * t * end.y,
    });
  }
};
const fullWedgeContours = (shape: WedgeHitShape, ring: number) => {
  const outer = [at(shape, 0, shape.outer)];
  appendArc(outer, shape, shape.outer, 0, 1);
  if (ring <= 0) {
    return [outer];
  }
  const inner = [at(shape, 0, ring)];
  appendArc(inner, shape, ring, 0, -1);
  return [outer, inner];
};
const donutContour = (
  shape: WedgeHitShape,
  ring: number,
  k: number,
  outerInset: number,
  innerInset: number
) => {
  const points = [at(shape, shape.from + outerInset, shape.outer)];
  appendArc(
    points,
    shape,
    shape.outer,
    shape.from + outerInset,
    shape.to - outerInset
  );
  appendQuadratic(
    points,
    at(shape, shape.to, shape.outer),
    at(shape, shape.to, shape.outer - k)
  );
  points.push(at(shape, shape.to, ring + k));
  appendQuadratic(
    points,
    at(shape, shape.to, ring),
    at(shape, shape.to - innerInset, ring)
  );
  appendArc(
    points,
    shape,
    ring,
    shape.to - innerInset,
    shape.from + innerInset
  );
  appendQuadratic(
    points,
    at(shape, shape.from, ring),
    at(shape, shape.from, ring + k)
  );
  points.push(at(shape, shape.from, shape.outer - k));
  appendQuadratic(
    points,
    at(shape, shape.from, shape.outer),
    at(shape, shape.from + outerInset, shape.outer)
  );
  return points;
};
export const wedgeContours = (shape: WedgeHitShape): PathPoint[][] => {
  if (
    Object.values(shape).some(
      (value) => !Number.isFinite(value) || Math.abs(value) > MAX_COORDINATE
    )
  ) {
    return [];
  }
  const sweep = shape.to - shape.from;
  if (shape.outer <= 0 || sweep <= 0) {
    return [];
  }
  const ring = Math.max(0, Math.min(shape.inner, shape.outer));
  if (sweep >= 1) {
    return fullWedgeContours(shape, ring);
  }
  const band = ring > 0 ? shape.outer - ring : shape.outer;
  const k = Math.max(
    0,
    Math.min(shape.corner, band / 2, sweep * shape.outer * Math.PI)
  );
  const outerInset = Math.min(k / (shape.outer * Math.PI * 2), sweep / 2);
  const innerInset =
    ring > 0 ? Math.min(k / (ring * Math.PI * 2), sweep / 2) : 0;
  if (ring > 0) {
    return [donutContour(shape, ring, k, outerInset, innerInset)];
  }
  const points = [
    { x: shape.cx, y: shape.cy },
    at(shape, shape.from, shape.outer - k),
  ];
  appendQuadratic(
    points,
    at(shape, shape.from, shape.outer),
    at(shape, shape.from + outerInset, shape.outer)
  );
  appendArc(
    points,
    shape,
    shape.outer,
    shape.from + outerInset,
    shape.to - outerInset
  );
  appendQuadratic(
    points,
    at(shape, shape.to, shape.outer),
    at(shape, shape.to, shape.outer - k)
  );
  return [points];
};
const contourWinding = (points: PathPoint[], x: number, y: number) => {
  let winding = 0;
  for (let index = 0; index < points.length; index += 1) {
    const a = points[index];
    const b = points[(index + 1) % points.length];
    const side = (b.x - a.x) * (y - a.y) - (x - a.x) * (b.y - a.y);
    if (a.y <= y) {
      if (b.y > y && side > 0) {
        winding += 1;
      }
    } else if (b.y <= y && side < 0) {
      winding -= 1;
    }
  }
  return winding;
};
export const contoursContainPoint = (
  contours: PathPoint[][],
  x: number,
  y: number
) =>
  contours.reduce((sum, points) => sum + contourWinding(points, x, y), 0) !== 0;
