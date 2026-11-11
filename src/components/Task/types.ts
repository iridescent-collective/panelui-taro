import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";

export type TaskStatus = "pending" | "running" | "complete" | "error";
export interface TaskProps extends ComponentProps<typeof View> {
  status?: TaskStatus;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export interface TaskTriggerProps extends Omit<
  AnimatedPressableProps,
  "children" | "style"
> {
  title?: string;
  icon?: ReactNode;
  children?: ReactNode;
}
export type TaskContentProps = ComponentProps<typeof View>;
export type TaskItemProps = ComponentProps<typeof View>;
export interface TaskFileProps extends ComponentProps<typeof View> {
  icon?: ReactNode;
}
export interface TaskContextValue {
  status: TaskStatus;
  open: boolean;
  setOpen: (open: boolean) => void;
}
