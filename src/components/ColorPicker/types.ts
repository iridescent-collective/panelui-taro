import type { ReactElement, ReactNode } from "react";

import type { ColorFormat } from "../../lib/color";
import type { PopoverContentProps } from "../Popover";

export type ColorPickerSize = "sm" | "md" | "lg";
export type ColorPickerPresentation = "inline" | "popover" | "bottom-sheet";
export interface ColorPickerProps {
  className?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (color: string) => void;
  onValueCommit?: (color: string) => void;
  format?: ColorFormat;
  disabled?: boolean;
  haptics?: boolean;
  size?: ColorPickerSize;
  presentation?: ColorPickerPresentation;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}
export interface ColorPickerTriggerProps {
  children: ReactElement<{
    onPress?: (...args: unknown[]) => void;
    onClick?: (...args: unknown[]) => void;
  }>;
}
export type ColorPickerContentProps = PopoverContentProps;
export interface ColorPickerAreaProps {
  className?: string;
  height?: number;
  thumbClassName?: string;
}
export interface ColorPickerWheelProps {
  className?: string;
  size?: number;
  thumbClassName?: string;
}
export interface ColorPickerHueProps {
  className?: string;
  thumbClassName?: string;
}
export interface ColorPickerBrightnessProps {
  className?: string;
  thumbClassName?: string;
}
export interface ColorPickerAlphaProps {
  className?: string;
  thumbClassName?: string;
}
export interface ColorPickerPreviewProps {
  className?: string;
  showValue?: boolean;
  swatchClassName?: string;
  valueClassName?: string;
  children?: ReactNode;
}
export interface ColorPickerSwatchesProps {
  className?: string;
  colors: string[];
  swatchSize?: number;
  swatchClassName?: string;
}
export interface ColorPickerFieldProps {
  className?: string;
  label?: string;
  showValue?: boolean;
  swatchClassName?: string;
  onPress?: (...args: unknown[]) => void;
  onClick?: (...args: unknown[]) => void;
  children?: ReactNode;
}
export type ColorPickerChannel = "hue" | "saturation" | "brightness" | "alpha";
export interface ColorPickerChannelProps {
  className?: string;
  channel: ColorPickerChannel;
  label?: string;
  format?: (value: number) => string;
}
