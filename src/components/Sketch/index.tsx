import { SketchRoot } from "./root";
import { SketchSheet } from "./sheet";

export type {
  SketchTool,
  SketchShape,
  SketchItem,
  SketchResult,
  SketchHandle,
  SketchProps,
  SketchSheetProps,
} from "./types";
export const hasSketchRaster = true;
export const Sketch = Object.assign(SketchRoot, { Sheet: SketchSheet });
