export interface OrbContext {
  globalAlpha: number;
  fillStyle: CanvasRenderingContext2D["fillStyle"];
  clearRect: (x: number, y: number, width: number, height: number) => void;
  scale: (x: number, y: number) => void;
  beginPath: () => void;
  moveTo: (x: number, y: number) => void;
  arc: (
    x: number,
    y: number,
    radius: number,
    start: number,
    end: number
  ) => void;
  fill: () => void;
}
export interface OrbCanvas {
  width: number;
  height: number;
  getContext: (kind: "2d") => unknown;
  requestAnimationFrame?: (callback: (time: number) => void) => number;
  cancelAnimationFrame?: (id: number) => void;
}
const contextMethods = [
  "clearRect",
  "scale",
  "beginPath",
  "moveTo",
  "arc",
  "fill",
] as const;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
export const readOrbCanvas = (
  value: unknown
): { canvas: OrbCanvas; context: OrbContext } | null => {
  if (
    !isRecord(value) ||
    typeof value.width !== "number" ||
    typeof value.height !== "number" ||
    typeof value.getContext !== "function"
  ) {
    return null;
  }
  const canvas = value as unknown as OrbCanvas;
  try {
    const context = canvas.getContext("2d");
    if (
      !isRecord(context) ||
      contextMethods.some((name) => typeof context[name] !== "function")
    ) {
      return null;
    }
    return { canvas, context: context as unknown as OrbContext };
  } catch {
    return null;
  }
};
const CIRCLE_PREFIX = /M-?\d+(?:\.\d+)? -?\d+(?:\.\d+)?a\d+(?:\.\d+)?/gu;
export const paintOrbPaths = (
  context: OrbContext,
  paths: readonly string[],
  size: number,
  ink: string
) => {
  context.clearRect(0, 0, size, size);
  context.fillStyle = ink;
  for (const [index, path] of paths.entries()) {
    context.globalAlpha = (index + 0.5) / 8;
    context.beginPath();
    for (const match of path.matchAll(CIRCLE_PREFIX)) {
      const [horizontal, vertical, radial] = match[0].slice(1).split(/[ a]/u);
      const x = Number(horizontal);
      const y = Number(vertical);
      const radius = Number(radial);
      context.moveTo(x + radius * 2, y);
      context.arc(x + radius, y, radius, 0, Math.PI * 2);
    }
    context.fill();
  }
  context.globalAlpha = 1;
};
