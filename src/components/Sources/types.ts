import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";

export interface SourcesProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}
export interface SourcesTriggerProps extends Omit<
  AnimatedPressableProps,
  "children" | "style"
> {
  count?: number;
  children?: ReactNode;
}
export interface SourcesContentProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  children?: ReactNode;
}
export interface SourcesSourceProps extends Omit<
  AnimatedPressableProps,
  "children" | "style"
> {
  href?: string;
  title?: string;
  icon?: ReactNode;
  children?: ReactNode;
  onLinkPress?: (href: string) => void;
}
