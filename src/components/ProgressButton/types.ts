import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ElementLayout } from "../../hooks/use-element-layout";
import type { AnimatedPressableProps } from "../../primitives/animated-pressable";

export type ProgressButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "success";
export type ProgressButtonSize = "sm" | "md" | "lg";
export type ProgressButtonShape = "pill" | "rounded";
export interface ProgressButtonProps extends Omit<
  AnimatedPressableProps,
  "disabled" | "children"
> {
  variant?: ProgressButtonVariant;
  size?: ProgressButtonSize;
  shape?: ProgressButtonShape;
  fullWidth?: boolean;
  holdDuration?: number;
  onComplete?: () => void;
  onCompletedChange?: (completed: boolean) => void;
  completed?: boolean;
  autoReset?: boolean;
  autoResetDelay?: number;
  disabled?: boolean;
  haptics?: boolean;
  children?: ReactNode;
  onLayout?: (layout: ElementLayout) => void;
}
export type ProgressButtonLabelProps = ComponentProps<typeof View>;
export type ProgressButtonDoneProps = ComponentProps<typeof View>;
