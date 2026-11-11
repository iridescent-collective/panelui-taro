import { createContext, useContext } from "react";
import type { MutableRefObject } from "react";

import type { CropBounds, CropFrame, CropShape, CropState, Size } from "./math";
import type { AvatarCropperSource } from "./types";
import type { CropMotionKind } from "./use-motion";

export interface CropperContextValue {
  shape: CropShape;
  bounds: CropBounds;
  fill: string;
  source: AvatarCropperSource;
  frame: CropFrame | null;
  state: CropState;
  raw: MutableRefObject<CropState>;
  begin: () => void;
  setCanvas: (size: Size) => void;
  write: (state: CropState, settle?: boolean, kind?: CropMotionKind) => void;
  rotate: (direction?: 1 | -1) => void;
  reset: () => void;
  zoomBy: (factor: number) => void;
}
export const CropperContext = createContext<CropperContextValue | null>(null);
export const useCropper = (part: string) => {
  const value = useContext(CropperContext);
  if (!value) {
    throw new Error(`${part} must be rendered inside <AvatarCropper>.`);
  }
  return value;
};
