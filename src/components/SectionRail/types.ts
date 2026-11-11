import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

export type SectionRailPlacement = "left" | "right";
export type SectionRailAlign = "center" | "top" | "bottom";
export interface SectionRailProps extends ComponentProps<typeof View> {
  placement?: SectionRailPlacement;
  align?: SectionRailAlign;
  haptics?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeDelay?: number;
  offset?: number;
  children: ReactNode;
}
export interface SectionRailTriggerProps extends ComponentProps<typeof View> {
  children: ReactNode;
}
export interface SectionRailBarProps {
  className?: string;
  value: string;
  level?: number;
}
export interface SectionRailContentProps extends ComponentProps<typeof View> {
  maxWidth?: number | `${number}%`;
  children: ReactNode;
}
export interface SectionRailItemProps {
  className?: string;
  value: string;
  level?: number;
  children: ReactNode;
}
