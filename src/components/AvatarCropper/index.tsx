import { AvatarCropperCanvas } from "./canvas";
import { AvatarCropperReset, AvatarCropperRotate } from "./controls";
import { AvatarCropperRoot } from "./root";

export { hasAvatarCropperExport, pickAvatarImage } from "./native";
export type {
  AvatarCrop,
  AvatarCropOptions,
  AvatarCropResult,
  AvatarCropperCanvasProps,
  AvatarCropperHandle,
  AvatarCropperProps,
  AvatarCropperResetProps,
  AvatarCropperRotateProps,
  AvatarCropperShape,
  AvatarCropperSource,
  PickAvatarImageOptions,
} from "./types";
export const AvatarCropper = Object.assign(AvatarCropperRoot, {
  Canvas: AvatarCropperCanvas,
  Reset: AvatarCropperReset,
  Rotate: AvatarCropperRotate,
});
