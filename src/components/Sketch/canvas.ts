import type { Canvas } from "@tarojs/taro";

import type { SketchItem } from "./types";

export type SketchInkContext = Pick<
  CanvasRenderingContext2D,
  | "lineWidth"
  | "lineCap"
  | "lineJoin"
  | "strokeStyle"
  | "globalCompositeOperation"
  | "clearRect"
  | "scale"
  | "beginPath"
  | "moveTo"
  | "lineTo"
  | "quadraticCurveTo"
  | "bezierCurveTo"
  | "closePath"
  | "save"
  | "restore"
  | "translate"
  | "arc"
  | "stroke"
>;
const PATH_TOKEN = /[MLlQCHVAZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/giu;
const COMMAND = /^[a-z]$/iu;
export const readSketchCanvas = (
  node: unknown
): {
  canvas: Canvas;
  context: SketchInkContext;
} | null => {
  if (
    !node ||
    typeof node !== "object" ||
    !("getContext" in node) ||
    typeof node.getContext !== "function"
  ) {
    return null;
  }
  try {
    const context: unknown = node.getContext("2d");
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
      "bezierCurveTo",
      "closePath",
      "save",
      "restore",
      "translate",
      "arc",
      "stroke",
    ]) {
      if (typeof Reflect.get(context, name) !== "function") {
        return null;
      }
    }
    return { canvas: node as Canvas, context: context as SketchInkContext };
  } catch {
    return null;
  }
};
export const paintSketchPath = (ctx: SketchInkContext, path: string) => {
  const tokens = path.match(PATH_TOKEN) ?? [];
  let offset = 0;
  let x = 0;
  let y = 0;
  let command = "";
  const read = () => {
    const value = Number(tokens[offset]);
    offset += 1;
    return value;
  };
  ctx.beginPath();
  while (offset < tokens.length) {
    if (COMMAND.test(tokens[offset])) {
      command = tokens[offset];
      offset += 1;
    }
    switch (command) {
      case "M": {
        x = read();
        y = read();
        ctx.moveTo(x, y);
        break;
      }
      case "L": {
        x = read();
        y = read();
        ctx.lineTo(x, y);
        break;
      }
      case "l": {
        x += read();
        y += read();
        ctx.lineTo(x, y);
        break;
      }
      case "H": {
        x = read();
        ctx.lineTo(x, y);
        break;
      }
      case "V": {
        y = read();
        ctx.lineTo(x, y);
        break;
      }
      case "Q": {
        const cx = read();
        const cy = read();
        x = read();
        y = read();
        ctx.quadraticCurveTo(cx, cy, x, y);
        break;
      }
      case "C": {
        const cx1 = read();
        const cy1 = read();
        const cx2 = read();
        const cy2 = read();
        x = read();
        y = read();
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x, y);
        break;
      }
      case "A": {
        const rx = read();
        const ry = read();
        read();
        read();
        const sweep = read();
        const endX = read();
        const endY = read();
        const centerX = (x + endX) / 2;
        const centerY = (y + endY) / 2;
        const start = x < centerX ? Math.PI : 0;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(rx, ry);
        ctx.arc(0, 0, 1, start, start + (sweep ? 1 : -1) * Math.PI, !sweep);
        ctx.restore();
        x = endX;
        y = endY;
        break;
      }
      case "Z": {
        ctx.closePath();
        command = "";
        break;
      }
      default: {
        throw new Error(`Sketch: unsupported path command ${command}`);
      }
    }
  }
  ctx.stroke();
};
export const paintSketchItems = (
  ctx: SketchInkContext,
  items: readonly SketchItem[]
) => {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const item of items) {
    ctx.globalCompositeOperation =
      item.type === "erase" ? "destination-out" : "source-over";
    ctx.strokeStyle = item.type === "erase" ? "#000000" : item.color;
    ctx.lineWidth = item.width;
    paintSketchPath(ctx, item.d);
  }
  ctx.globalCompositeOperation = "source-over";
};
