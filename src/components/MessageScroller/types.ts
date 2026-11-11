import type { ScrollView, View } from "@tarojs/components";
import type { ComponentProps, ReactNode, ReactElement } from "react";

import type { LineChartLayoutEvent } from "../LineChart/types";

export type MessageScrollerPosition = "start" | "end" | "last-anchor";
export interface MessageScrollerProps extends ComponentProps<typeof View> {
  autoScroll?: boolean;
  preserveScrollOnPrepend?: boolean;
  defaultScrollPosition?: MessageScrollerPosition;
}
export interface MessageScrollerViewportProps extends Omit<
  ComponentProps<typeof ScrollView>,
  "scrollTop" | "children"
> {
  children?: ReactNode;
}
export interface MessageScrollerContentProps extends ComponentProps<
  typeof View
> {
  onLayout?: (event: LineChartLayoutEvent) => void;
}
export interface MessageScrollerItemProps extends MessageScrollerContentProps {
  messageId: string;
  scrollAnchor?: boolean;
}
export interface MessageScrollerButtonProps extends ComponentProps<
  typeof View
> {
  target?: "start" | "end";
  accessibilityLabel?: string;
}
export interface MessageScrollerListItem {
  messageId: string;
  scrollAnchor?: boolean;
}
export interface MessageScrollerRenderInfo<T> {
  item: T;
  index: number;
  separators: {
    highlight: () => void;
    unhighlight: () => void;
    updateProps: (select: "leading" | "trailing", props: unknown) => void;
  };
}
export interface MessageScrollerListProps<
  T extends MessageScrollerListItem = MessageScrollerListItem,
> extends Omit<MessageScrollerViewportProps, "children"> {
  data: readonly T[];
  renderItem: (info: MessageScrollerRenderInfo<T>) => ReactElement | null;
  contentContainerClassName?: string;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  getItemLayout?: (
    data: readonly T[] | null | undefined,
    index: number
  ) => { length: number; offset: number; index: number };
}
export interface MessageScrollerDriver {
  scrollToEnd: (animated: boolean) => void;
  scrollToStart: (animated: boolean) => void;
  scrollToMessage: (id: string, animated: boolean) => boolean;
}
export interface MessageScrollerRow {
  y: number;
  height: number;
  anchor: boolean;
}
