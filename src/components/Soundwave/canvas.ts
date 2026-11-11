import { withColorAlpha } from "../../lib/color";

export interface WaveGradient {
  addColorStop: (offset: number, color: string) => void;
}
export interface WaveContext {
  globalAlpha: number;
  lineWidth: number;
  lineCap: string;
  lineJoin: string;
  strokeStyle: string | WaveGradient | CanvasPattern;
  clearRect: (x: number, y: number, width: number, height: number) => void;
  scale: (x: number, y: number) => void;
  beginPath: () => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  stroke: () => void;
  createLinearGradient: (
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ) => WaveGradient;
}
export interface WaveCanvas {
  width: number;
  height: number;
  getContext: (kind: "2d") => unknown;
}
const methods = [
  "clearRect",
  "scale",
  "beginPath",
  "moveTo",
  "lineTo",
  "stroke",
  "createLinearGradient",
] as const;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
export const readWaveCanvas = (
  value: unknown
): { canvas: WaveCanvas; context: WaveContext } | null => {
  if (
    !isRecord(value) ||
    typeof value.width !== "number" ||
    typeof value.height !== "number" ||
    typeof value.getContext !== "function"
  ) {
    return null;
  }
  const canvas = value as unknown as WaveCanvas;
  try {
    const context = canvas.getContext("2d");
    if (
      !isRecord(context) ||
      methods.some((method) => typeof context[method] !== "function")
    ) {
      return null;
    }
    return { canvas, context: context as unknown as WaveContext };
  } catch {
    return null;
  }
};
export interface WavePaint {
  paths: readonly string[];
  width: number;
  height: number;
  stroke: number;
  ink: string;
  track?: string;
  hasProgress: boolean;
  gradient?: readonly string[];
  fade: boolean;
  edge: number;
}
export const gradientStops = (
  colors: readonly string[],
  fade: boolean,
  edge: number
) => {
  const palette = colors.length ? colors : ["#000000"];
  const span = fade ? 1 - edge * 2 : 1;
  const from = fade ? edge : 0;
  const stops = palette.map((color, index) => ({
    color,
    offset:
      palette.length > 1 ? from + (index / (palette.length - 1)) * span : from,
    opacity: 1,
  }));
  if (fade) {
    stops.unshift({ color: palette[0] ?? "#000000", offset: 0, opacity: 0 });
    stops.push({ color: palette.at(-1) ?? "#000000", offset: 1, opacity: 0 });
  }
  return stops;
};
const POINTS = /[ML]-?\d+(?:\.\d+)? -?\d+(?:\.\d+)?/gu;
const readPoints = (path: string) =>
  Array.from(path.matchAll(POINTS), (point) => {
    const [horizontal, vertical] = point[0].slice(1).split(" ");
    return {
      move: point[0][0] === "M",
      x: Number(horizontal),
      y: Number(vertical),
    };
  });
const pathInk = (
  context: WaveContext,
  paint: WavePaint,
  points: ReturnType<typeof readPoints>
) => {
  if (
    (!paint.fade && (paint.gradient?.length ?? 0) <= 1) ||
    points.length === 0
  ) {
    return paint.ink;
  }
  const min = Math.min(...points.map((point) => point.x));
  const max = Math.max(...points.map((point) => point.x));
  const left = min === max ? min - paint.stroke / 2 : min;
  const right = min === max ? max + paint.stroke / 2 : max;
  const ramp = context.createLinearGradient(left, 0, right, 0);
  for (const stop of gradientStops(
    paint.gradient?.length ? paint.gradient : [paint.ink],
    paint.fade,
    paint.edge
  )) {
    ramp.addColorStop(
      stop.offset,
      stop.opacity === 1 ? stop.color : withColorAlpha(stop.color, stop.opacity)
    );
  }
  return ramp;
};
export const paintWave = (context: WaveContext, paint: WavePaint) => {
  context.clearRect(0, 0, paint.width, paint.height);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = paint.stroke;
  for (const [index, path] of paint.paths.entries()) {
    const unplayed = paint.paths.length > 1 && index === 0;
    const points = readPoints(path);
    context.strokeStyle =
      unplayed && paint.track ? paint.track : pathInk(context, paint, points);
    context.globalAlpha =
      unplayed && !paint.track && paint.hasProgress ? 0.3 : 1;
    context.beginPath();
    for (const point of points) {
      if (point.move) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    }
    context.stroke();
  }
  context.globalAlpha = 1;
};
