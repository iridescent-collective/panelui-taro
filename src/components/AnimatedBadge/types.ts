import type { View } from "@tarojs/components";
import type { AriaAttributes, ComponentProps, ReactNode } from "react";

export type AnimatedBadgeStatus =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "loading";
export type AnimatedBadgeSize = "sm" | "md";
export interface AnimatedBadgeProps
  extends ComponentProps<typeof View>, AriaAttributes {
  status?: AnimatedBadgeStatus;
  size?: AnimatedBadgeSize;
  icon?: ReactNode;
  showIcon?: boolean;
  pulse?: boolean;
  contentKey?: string | number;
  animateLayout?: boolean;
  labelClassName?: string;
  accessibilityLabel?: string;
}
export interface RollProps {
  contentKey: string | number;
  children?: ReactNode;
  reducedMotion: boolean;
  turn?: boolean;
}
