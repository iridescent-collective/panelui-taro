import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ElementLayout } from "../../hooks/use-element-layout";

export type SlideButtonVariant = "secondary" | "destructive" | "success";
export type SlideButtonSize = "sm" | "md" | "lg";
export interface SlideButtonProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  variant?: SlideButtonVariant;
  size?: SlideButtonSize;
  fullWidth?: boolean;
  threshold?: number;
  onComplete?: () => void;
  onCompletedChange?: (completed: boolean) => void;
  completed?: boolean;
  autoReset?: boolean;
  autoResetDelay?: number;
  disabled?: boolean;
  haptics?: boolean;
  accessibilityActionLabel?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: {
    checked?: boolean | "mixed";
    disabled?: boolean;
    selected?: boolean;
    expanded?: boolean;
    busy?: boolean;
  };
  children?: ReactNode;
  onLayout?: (layout: ElementLayout) => void;
}
export interface SlideButtonLabelProps extends ComponentProps<typeof View> {
  children?: ReactNode;
}
export interface SlideButtonThumbProps extends ComponentProps<typeof View> {
  children?: ReactNode;
}
