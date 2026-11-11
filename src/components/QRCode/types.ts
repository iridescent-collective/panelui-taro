import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type {
  PopoverContentProps,
  PopoverTriggerProps,
} from "../Popover/types";
import type { ErrorCorrectionLevel } from "./qr-encode";
import type {
  QRCodeEyeBallShape,
  QRCodeEyeFrameShape,
  QRCodeModuleShape,
} from "./qr-shapes";

export type QRCodeSize = "sm" | "md" | "lg";
export type QRCodePresentation = "inline" | "popover" | "bottom-sheet";
export interface QRCodeProps extends ComponentProps<typeof View> {
  value: string;
  errorCorrection?: ErrorCorrectionLevel;
  version?: number;
  size?: QRCodeSize;
  presentation?: QRCodePresentation;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export interface QRCodeCanvasProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  pixelSize?: number;
  color?: string;
  backgroundColor?: string;
  moduleShape?: QRCodeModuleShape;
  eyeFrameShape?: QRCodeEyeFrameShape;
  eyeBallShape?: QRCodeEyeBallShape;
  eyeFrameColor?: string;
  eyeBallColor?: string;
}
export type QRCodeFrameProps = ComponentProps<typeof View>;
export type QRCodeHeaderProps = ComponentProps<typeof View>;
export type QRCodeActionProps = ComponentProps<typeof View>;
export type QRCodePanelProps = ComponentProps<typeof View>;
export type QRCodeLogoProps = ComponentProps<typeof View>;
export interface QRCodeTitleProps {
  className?: string;
  children?: ReactNode;
}
export type QRCodeDescriptionProps = QRCodeTitleProps;
export type QRCodeCaptionProps = QRCodeTitleProps;
export interface QRCodeValueProps {
  className?: string;
  full?: boolean;
}
export type QRCodeTriggerProps = PopoverTriggerProps;
export type QRCodeContentProps = PopoverContentProps;
