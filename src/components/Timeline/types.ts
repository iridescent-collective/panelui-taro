import type { View, ScrollView } from "@tarojs/components";
import type { ComponentProps, ReactNode, ReactElement } from "react";

export type TimelineViewProps = ComponentProps<typeof View>;
export type TimelineVariant = "dot" | "icon" | "numbered" | "card" | "compact";
export type TimelineTone =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "danger";
export type TimelineOrientation = "vertical" | "horizontal";
export interface TimelineProps extends TimelineViewProps {
  className?: string;
  value?: number;
  variant?: TimelineVariant;
  orientation?: TimelineOrientation;
  snap?: boolean;
  haptics?: boolean;
  onColumnChange?: (index: number) => void;
  children?: ReactNode;
}
export interface TimelineItemProps extends TimelineViewProps {
  className?: string;
  step: number;
  completed?: boolean;
  tone?: TimelineTone;
  last?: boolean;
  width?: number;
  children?: ReactNode;
}
export interface TimelineIndicatorProps extends TimelineViewProps {
  className?: string;
  children?: ReactNode;
}
export interface TimelineStatProps extends TimelineViewProps {
  className?: string;
  label: string;
  value: string;
}
export interface TimelineMastheadProps extends TimelineViewProps {
  className?: string;
  media?: ReactNode;
  label?: string;
  title?: string;
  children?: ReactNode;
}

export interface TimelineListRenderItemInfo<T> {
  item: T;
  index: number;
  separators: {
    highlight: () => void;
    unhighlight: () => void;
    updateProps: (
      select: "leading" | "trailing",
      newProps: Record<string, unknown>
    ) => void;
  };
}
export interface TimelineListProps<T> extends Omit<
  ComponentProps<typeof ScrollView>,
  "children" | "onScroll" | "scrollX" | "scrollLeft"
> {
  data: readonly T[];
  renderItem: (
    info: TimelineListRenderItemInfo<T>
  ) => ReactElement<TimelineItemProps>;
  itemWidth?: number | ((item: T, index: number) => number);
  value?: number;
  variant?: TimelineVariant;
  snap?: boolean;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  keyExtractor?: (item: T, index: number) => string;
}
