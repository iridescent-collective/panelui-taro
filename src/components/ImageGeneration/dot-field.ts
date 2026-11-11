export const DOT_GAP = 10;
export const DOT_RADIUS = 1;
export const DOT_LIT_RADIUS = 1.9;
export const DOT_REST_OPACITY = 0.16;
export const LIT_OPACITY = 0.9;
export const FRAMES = 24;
const MAX_DOTS = 700;
export type DotFieldAnimation = "drift" | "pulse" | "scan";
export const gapFor = (width: number, height: number): number => {
  if (width <= 0 || height <= 0) {
    return DOT_GAP;
  }
  const cells = (width / DOT_GAP + 1) * (height / DOT_GAP + 1);
  return cells > MAX_DOTS ? DOT_GAP * Math.sqrt(cells / MAX_DOTS) : DOT_GAP;
};
const circle = (x: number, y: number, r: number): string => {
  const d = (r * 2).toFixed(2);
  return `M${(x - r).toFixed(2)},${y.toFixed(2)}a${r},${r} 0 1,0 ${d},0a${r},${r} 0 1,0 -${d},0`;
};
const anchors = (width: number, height: number): [number, number][] => {
  const gap = gapFor(width, height);
  const margin = DOT_LIT_RADIUS;
  const innerWidth = Math.max(0, width - margin * 2);
  const innerHeight = Math.max(0, height - margin * 2);
  const columns = Math.floor(innerWidth / gap) + 1;
  const rows = Math.floor(innerHeight / gap) + 1;
  const offsetX = margin + (innerWidth - (columns - 1) * gap) / 2;
  const offsetY = margin + (innerHeight - (rows - 1) * gap) / 2;
  const out: [number, number][] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      out.push([offsetX + column * gap, offsetY + row * gap]);
    }
  }
  return out;
};
export const gridPath = (width: number, height: number): string => {
  if (width <= 0 || height <= 0) {
    return "";
  }
  let path = "";
  for (const [x, y] of anchors(width, height)) {
    path += circle(x, y, DOT_RADIUS);
  }
  return path;
};
export const dotCount = (width: number, height: number): number => {
  if (width <= 0 || height <= 0) {
    return 0;
  }
  return anchors(width, height).length;
};
export const influenceAt = (distance: number, radius: number): number => {
  if (radius <= 0) {
    return 0;
  }
  const proximity = Math.max(0, 1 - distance / radius);
  return proximity * proximity * (3 - 2 * proximity);
};
const lightAt = (
  animation: DotFieldAnimation,
  phase: number,
  width: number,
  height: number
): {
  x: number;
  y: number;
  radius: number;
  ring: number;
} => {
  const short = Math.min(width, height);
  const turn = phase * Math.PI * 2;
  if (animation === "pulse") {
    const reach = Math.hypot(width, height) / 2;
    return {
      radius: short * 0.3,
      ring: phase * reach,
      x: width / 2,
      y: height / 2,
    };
  }
  if (animation === "scan") {
    const radius = width * 0.28;
    return {
      radius,
      ring: 0,
      x: -radius * 0.5 + phase * (width + radius),
      y: Number.NaN,
    };
  }
  return {
    radius: short * 0.42,
    ring: 0,
    x: width / 2 + Math.sin(turn) * width * 0.26,
    y: height / 2 + Math.cos(turn * 2) * height * 0.22,
  };
};
export const litPath = (
  width: number,
  height: number,
  phase: number,
  animation: DotFieldAnimation = "drift",
  points?: [number, number][]
): string => {
  if (width <= 0 || height <= 0) {
    return "";
  }
  const light = lightAt(animation, phase, width, height);
  let path = "";
  for (const [x, y] of points ?? anchors(width, height)) {
    const deltaX = x - light.x;
    const deltaY = Number.isNaN(light.y) ? 0 : y - light.y;
    const distance = Math.abs(Math.hypot(deltaX, deltaY) - light.ring);
    const influence = influenceAt(distance, light.radius);
    if (influence <= 0.02) {
      continue;
    }
    path += circle(
      x,
      y,
      DOT_RADIUS + influence * (DOT_LIT_RADIUS - DOT_RADIUS)
    );
  }
  return path;
};
export const litFrames = (
  width: number,
  height: number,
  animation: DotFieldAnimation = "drift"
): string[] => {
  const points = width > 0 && height > 0 ? anchors(width, height) : [];
  return Array.from({ length: FRAMES }, (_unused, index) =>
    litPath(width, height, index / FRAMES, animation, points)
  );
};
export const PERIOD: Record<DotFieldAnimation, number> = {
  drift: 4200,
  pulse: 2200,
  scan: 1900,
};
export const frameAt = (time: number, animation: DotFieldAnimation): number => {
  const phase = (time % PERIOD[animation]) / PERIOD[animation];
  return Math.min(FRAMES - 1, Math.floor(phase * FRAMES));
};
export const framePhase = (
  time: number,
  animation: DotFieldAnimation
): number => ((time % PERIOD[animation]) / PERIOD[animation]) * FRAMES;
export const crossfadeAlphas = (t: number): [number, number] => {
  const out = LIT_OPACITY * (1 - t);
  return [out, 1 - (1 - LIT_OPACITY) / (1 - out)];
};
