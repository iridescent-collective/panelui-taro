import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ButtonProps } from "../Button";
import type { CropShape, SourceCrop } from "./math";

export type AvatarCropperShape = CropShape;
export type AvatarCrop = SourceCrop;
export interface AvatarCropperSource {
  uri: string;
  width?: number;
  height?: number;
}
export interface PickAvatarImageOptions {
  from?: "library" | "camera";
  quality?: number;
}
export interface AvatarCropResult {
  uri: string;
  width: number;
  height: number;
}
export interface AvatarCropOptions {
  size?: number;
  format?: "jpeg" | "png" | "webp";
  compress?: number;
}
export interface AvatarCropperHandle {
  crop: (options?: AvatarCropOptions) => Promise<AvatarCropResult>;
  getCrop: () => SourceCrop | null;
  rotate: (direction?: 1 | -1) => void;
  reset: () => void;
}
export interface AvatarCropperProps extends ComponentProps<typeof View> {
  source: AvatarCropperSource;
  shape?: CropShape;
  maxZoom?: number;
  cover?: boolean;
  minZoom?: number;
  background?: string;
  inset?: number;
  children?: ReactNode;
}
export interface AvatarCropperCanvasProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  accessibilityLabel?: string;
}
export interface AvatarCropperRotateProps extends Omit<
  ButtonProps,
  "onPress" | "onClick"
> {
  direction?: "clockwise" | "counterclockwise";
}
export type AvatarCropperResetProps = Omit<ButtonProps, "onPress" | "onClick">;
