const directionTravel = (
  direction: StackCardDirection,
  x: number,
  y: number
) => {
  if (direction === "left") {
    return -x;
  }
  if (direction === "right") {
    return x;
  }
  if (direction === "up") {
    return -y;
  }
  return y;
};
export type StackCardDirection = "left" | "right" | "up" | "down";
export const DECELERATION = 0.998;
export const project = (velocity: number, deceleration?: number): number => {
  const rate = deceleration ?? DECELERATION;
  return ((velocity / 1000) * rate) / (1 - rate);
};
export const resist = (travel: number, span: number, give: number): number => {
  if (span <= 0) {
    return 0;
  }
  return (travel * span * give) / (span + give * Math.abs(travel));
};
export const commitReach = (span: number, threshold: number): number =>
  Math.max(span * threshold, 1);
export const directionProgress = (
  direction: StackCardDirection,
  x: number,
  y: number,
  width: number,
  height: number,
  threshold: number
): number => {
  const sideways = direction === "left" || direction === "right";
  const reach = commitReach(sideways ? width : height, threshold);
  const travel = directionTravel(direction, x, y);
  return Math.min(Math.max(travel / reach, 0), 1);
};
export const releaseProgress = (
  allowed: readonly StackCardDirection[],
  x: number,
  y: number,
  width: number,
  height: number,
  threshold: number
): number => {
  let furthest = 0;
  for (const direction of allowed) {
    if (!direction) {
      continue;
    }
    const progress = directionProgress(
      direction,
      x,
      y,
      width,
      height,
      threshold
    );
    if (progress > furthest) {
      furthest = progress;
    }
  }
  return furthest;
};
export const releasedDirection = (
  allowed: readonly StackCardDirection[],
  x: number,
  y: number,
  velocityX: number,
  velocityY: number,
  width: number,
  height: number,
  threshold: number
): StackCardDirection | null => {
  const projectedX = x + project(velocityX);
  const projectedY = y + project(velocityY);
  let sent: StackCardDirection | null = null;
  let furthest = 1;
  for (const direction of allowed) {
    if (!direction) {
      continue;
    }
    const sideways = direction === "left" || direction === "right";
    const reach = commitReach(sideways ? width : height, threshold);
    const travel = directionTravel(direction, projectedX, projectedY);
    const ratio = travel / reach;
    if (ratio >= furthest) {
      furthest = ratio;
      sent = direction;
    }
  }
  return sent;
};
const EXIT_OVERSHOOT = 1.35;
const EXIT_CARRY = 1.4;
export const exitTarget = (
  direction: StackCardDirection,
  width: number,
  height: number,
  x: number,
  y: number
): {
  x: number;
  y: number;
} => {
  switch (direction) {
    case "left": {
      return { x: -width * EXIT_OVERSHOOT, y: y * EXIT_CARRY };
    }
    case "right": {
      return { x: width * EXIT_OVERSHOOT, y: y * EXIT_CARRY };
    }
    case "up": {
      return { x: x * EXIT_CARRY, y: -height * EXIT_OVERSHOOT };
    }
    default: {
      return { x: x * EXIT_CARRY, y: height * EXIT_OVERSHOOT };
    }
  }
};
export const exitDuration = (
  distance: number,
  speed: number,
  slope: number,
  shortest: number,
  longest: number
): number => {
  if (speed <= 0) {
    return longest;
  }
  const matched = ((slope * Math.abs(distance)) / speed) * 1000;
  return Math.min(Math.max(matched, shortest), longest);
};
export const lever = (grabY: number, height: number): number => {
  if (height <= 0) {
    return 1;
  }
  return grabY <= height / 2 ? 1 : -1;
};
export const tiltAngle = (
  x: number,
  width: number,
  maxTilt: number,
  pivot: number
): number => {
  if (width <= 0) {
    return 0;
  }
  const raw = (x / (width * 0.5)) * maxTilt * pivot;
  return Math.max(-maxTilt, Math.min(maxTilt, raw));
};
export const effectiveDepth = (depth: number, release: number): number =>
  Math.max(0, depth - release);
export const depthOpacity = (depth: number, visible: number): number =>
  Math.min(1, Math.max(0, visible + 1 - depth));
