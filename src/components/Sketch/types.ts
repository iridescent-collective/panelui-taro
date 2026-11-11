import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

export type SketchTool = "pen" | "shape" | "eraser";
export type SketchShape =
  | "line"
  | "arrow"
  | "rectangle"
  | "ellipse"
  | "triangle"
  | "diamond"
  | "star"
  | "heart";
export type SketchItem =
  | {
      type: "stroke";
      d: string;
      color: string;
      width: number;
    }
  | {
      type: "shape";
      shape: SketchShape;
      d: string;
      color: string;
      width: number;
    }
  | {
      type: "erase";
      d: string;
      width: number;
    };
export interface SketchResult {
  svg: string;
  width: number;
  height: number;
  items: SketchItem[];
}
export interface SketchHandle {
  undo: () => void;
  clear: () => void;
  isEmpty: () => boolean;
  toSVG: () => string;
  toPNG: (options?: { scale?: number }) => Promise<string>;
}
export interface SketchProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  className?: string;
  colors?: string[];
  defaultColor?: string;
  defaultTool?: SketchTool;
  defaultShape?: SketchShape;
  shapes?: SketchShape[];
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  customColor?: boolean;
  onClose?: () => void;
  onDone?: (result: SketchResult) => void;
  onChange?: (itemCount: number) => void;
}
export interface SketchSheetProps extends SketchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  native?: boolean;
}
