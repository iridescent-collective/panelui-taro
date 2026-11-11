import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode, RefObject } from "react";

export type SortableActivation = "handle" | "longPress";
export interface SortableReorderDetails {
  id: string;
  from: number;
  to: number;
}
export interface SortableScrollHandle {
  readNativeMetrics: () => {
    offset: number;
    pageY: number;
    height: number;
  } | null;
  scrollToNative: (offset: number) => void;
}
export interface SortableProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  value: string[];
  children?: ReactNode;
  onReorder?: (order: string[], details: SortableReorderDetails) => void;
  gap?: number;
  activation?: SortableActivation;
  longPressDelay?: number;
  haptics?: boolean;
  disabled?: boolean;
  scrollRef?: RefObject<SortableScrollHandle>;
  autoscrollThreshold?: number;
  autoscrollSpeed?: number;
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string) => void;
}
export interface SortableItemProps extends Omit<
  ComponentProps<typeof View>,
  "children" | "id"
> {
  id: string;
  children?: ReactNode;
  disabled?: boolean;
  pinned?: boolean;
  activeClassName?: string;
}
export interface SortableHandleProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  children?: ReactNode;
  accessibilityLabel?: string;
}
export interface SortableFrame {
  order: string[];
  rendered: string[];
  heights: Record<string, number>;
  pinned: Record<string, boolean>;
  activeId: string | null;
  translate: number;
  lift: number;
  fingerY: number;
}
