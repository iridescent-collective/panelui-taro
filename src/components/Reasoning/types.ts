import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";

export interface ReasoningProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  isStreaming?: boolean;
  duration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}
export interface ReasoningTriggerProps extends Omit<
  AnimatedPressableProps,
  "children" | "style"
> {
  label?: (isStreaming: boolean, duration?: number) => ReactNode;
  children?: ReactNode;
}
export type ReasoningContentProps = ComponentProps<typeof View>;
export interface ReasoningContextValue {
  isStreaming: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  duration: number | undefined;
}
