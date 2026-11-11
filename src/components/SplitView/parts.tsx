import { View } from "@tarojs/components";
import { useEffect, useSyncExternalStore } from "react";

import { useSpringNumber } from "../../hooks/use-spring-number";
import { mergeStyle, mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { GRIP_SPRING } from "./constants";
import { useSplitViewContext } from "./context";
import type { SplitViewPaneProps, SplitViewHandleProps } from "./types";
import { splitViewVariants } from "./variants";

export const SplitViewTop = ({
  className,
  children,
  style,
  ...props
}: SplitViewPaneProps) => {
  const context = useSplitViewContext("SplitView.Top");
  const height = useSyncExternalStore(
    context.topHeight.subscribe,
    context.topHeight.getSnapshot,
    context.topHeight.getSnapshot
  );
  const unmeasured = context.measured
    ? {}
    : { flexBasis: 0, flexGrow: 1, flexShrink: 1 };
  return (
    <View
      {...props}
      className={cn(
        "flex shrink-0 flex-col",
        splitViewVariants({ variant: context.variant }).top({ className })
      )}
      style={mergeStyleAfter(mergeStyle(unmeasured, style), {
        height: `${height * 2}rpx`,
      })}
    >
      {children}
    </View>
  );
};
export const SplitViewBottom = ({
  className,
  children,
  ...props
}: SplitViewPaneProps) => {
  const context = useSplitViewContext("SplitView.Bottom");
  return (
    <View
      {...props}
      className={cn(
        "flex min-h-0 flex-col",
        splitViewVariants({ variant: context.variant }).bottom({ className })
      )}
    >
      {children}
    </View>
  );
};
export const SplitViewHandle = ({
  className,
  children,
  style,
  ...props
}: SplitViewHandleProps) => {
  const context = useSplitViewContext("SplitView.Handle");
  const dragging = useSyncExternalStore(
    context.dragging.subscribe,
    context.dragging.getSnapshot,
    context.dragging.getSnapshot
  );
  const { value, springTo } = useSpringNumber(1, GRIP_SPRING, !context.animate);
  useEffect(
    () => springTo(context.animate && dragging ? 1.15 : 1),
    [context.animate, dragging, springTo]
  );
  return (
    <View
      {...props}
      className={
        children
          ? undefined
          : splitViewVariants({ variant: context.variant }).handle({
              className,
            })
      }
      style={mergeStyleAfter(style, { transform: `scaleX(${value})` })}
    >
      {children}
    </View>
  );
};
