import type { SketchShape, SketchTool } from "./types";

export const ALL_SHAPES: SketchShape[] = [
  "line",
  "arrow",
  "rectangle",
  "ellipse",
  "triangle",
  "diamond",
  "star",
  "heart",
];
export const DEFAULT_COLORS = [
  "#ffffff",
  "#000000",
  "#8e8e93",
  "#ef4444",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];
export const SHAPE_LABEL: Record<SketchShape, string> = {
  arrow: "Arrow",
  diamond: "Diamond",
  ellipse: "Ellipse",
  heart: "Heart",
  line: "Line",
  rectangle: "Rectangle",
  star: "Star",
  triangle: "Triangle",
};
export const TOOL_LABEL: Record<SketchTool, string> = {
  eraser: "Eraser",
  pen: "Pen",
  shape: "Shapes",
};
export const SLIDER_TRACK = 140;
export const SLIDER_THUMB = 28;
export const SLIDER_HIT = 44;
export const MIN_DISTANCE = 1.5;
export const ERASER_SCALE = 2.5;
export const GLYPH_STROKE = 1.8;
