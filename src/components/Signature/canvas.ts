import type { Canvas } from "@tarojs/taro";

export interface SignatureInkContext {
  lineWidth: number;
  lineCap: string;
  lineJoin: string;
  strokeStyle: CanvasRenderingContext2D["strokeStyle"];
  clearRect: (x: number, y: number, w: number, h: number) => void;
  scale: (x: number, y: number) => void;
  beginPath: () => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  quadraticCurveTo: (cx: number, cy: number, x: number, y: number) => void;
  stroke: () => void;
}
export const readSignatureCanvas = (
  value: unknown
): { canvas: Canvas; context: SignatureInkContext } | null => {
  if (
    !value ||
    typeof value !== "object" ||
    !("getContext" in value) ||
    typeof value.getContext !== "function"
  ) {
    return null;
  }
  try {
    const context: unknown = value.getContext("2d");
    if (!context || typeof context !== "object") {
      return null;
    }
    for (const name of [
      "clearRect",
      "scale",
      "beginPath",
      "moveTo",
      "lineTo",
      "quadraticCurveTo",
      "stroke",
    ]) {
      if (
        !(name in context) ||
        typeof Reflect.get(context, name) !== "function"
      ) {
        return null;
      }
    }
    return { canvas: value as Canvas, context: context as SignatureInkContext };
  } catch {
    return null;
  }
};
export const paintSignatureStroke = (
  context: SignatureInkContext,
  points: readonly number[]
) => {
  if (points.length < 2) {
    return;
  }
  context.beginPath();
  context.moveTo(points[0] ?? 0, points[1] ?? 0);
  if (points.length === 2) {
    context.lineTo(points[0] + 0.01, points[1]);
  } else {
    for (let index = 2; index < points.length; index += 2) {
      const px = points[index - 2];
      const py = points[index - 1];
      const x = points[index];
      const y = points[index + 1];
      context.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
    }
    context.lineTo(points.at(-2) ?? 0, points.at(-1) ?? 0);
  }
  context.stroke();
};
