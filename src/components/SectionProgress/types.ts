import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";

export type SectionProgressPlacement =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
export type SectionProgressColor =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "foreground";
export interface SectionProgressScroll {
  offset: ObservableNumber;
  viewport: ObservableNumber;
  content: ObservableNumber;
}
export interface SectionProgressProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  scroll?: SectionProgressScroll;
  progress?: ObservableNumber | number;
  value?: string;
  defaultValue?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  placement?: SectionProgressPlacement;
  offset?: number;
  revealAt?: number;
  haptics?: boolean;
  label?: string;
  children: ReactNode;
}
export interface SectionProgressItemProps {
  className?: string;
  value: string;
  color?: SectionProgressColor;
  children: ReactNode;
}
