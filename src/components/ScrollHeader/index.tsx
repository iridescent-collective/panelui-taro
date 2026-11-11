import { View } from "@tarojs/components";
import { Children, forwardRef, isValidElement, useMemo } from "react";
import type { ComponentRef, ReactElement, ReactNode } from "react";

import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { mergeStyle } from "../../lib/styles";
import { ScrollHeaderContext, useHeaderNumber } from "./context";
import { ScrollHeaderCover } from "./cover";
import { bandHeight } from "./math";
import {
  ScrollHeaderActions,
  ScrollHeaderBar,
  ScrollHeaderDescription,
  ScrollHeaderLarge,
  ScrollHeaderTitle,
} from "./parts";
import { HeaderScrollable } from "./scrollable";
import type {
  HeaderScrollableProps,
  ScrollHeaderContextValue,
  ScrollHeaderProps,
} from "./types";
import { useScrollHeaderModel } from "./use-model";
import { scrollHeaderVariants } from "./variants";

export type {
  ScrollHeaderProps,
  ScrollHeaderBarProps,
  ScrollHeaderLargeProps,
  ScrollHeaderActionsProps,
  ScrollHeaderCoverProps,
  ScrollHeaderMaterial,
  ScrollHeaderSurface,
  ScrollHeaderSlot,
} from "./types";
const splitChildren = (children: ReactNode) => {
  let cover: ReactNode = null;
  let large: ReactNode = null;
  let bar: ReactNode = null;
  let scrollable: ReactElement<HeaderScrollableProps> | null = null;
  for (const child of Children.toArray(children)) {
    if (!isValidElement<HeaderScrollableProps>(child)) {
      continue;
    }
    if (child.type === ScrollHeaderCover) {
      cover = child;
    } else if (child.type === ScrollHeaderLarge) {
      large = child;
    } else if (child.type === ScrollHeaderBar) {
      bar = child;
    } else if (!scrollable) {
      scrollable = child;
    }
  }
  return { bar, cover, large, scrollable };
};
const HeaderBand = ({
  context,
  stretch,
  reduced,
  children,
}: {
  context: ScrollHeaderContextValue;
  stretch: boolean;
  reduced: boolean;
  children: ReactNode;
}) => {
  const offset = useHeaderNumber(context.offset);
  const height = useHeaderNumber(context.largeHeight);
  return (
    <View
      className={scrollHeaderVariants().band()}
      style={{
        height: `${bandHeight(context.barBand, height, offset, stretch && !reduced) * 2}rpx`,
        pointerEvents: "none",
        zIndex: 4,
      }}
    >
      {children}
    </View>
  );
};
const ScrollHeaderRoot = forwardRef<
  ComponentRef<typeof View>,
  ScrollHeaderProps
>((props, ref) => {
  const {
    className,
    barHeight = 48,
    threshold: _threshold,
    snap = true,
    stretch = true,
    inset = true,
    onCollapsedChange: _onCollapsedChange,
    progress: _progress,
    children,
    style,
    ...native
  } = props;
  const { insets } = useWindowMetrics();
  const model = useScrollHeaderModel(props);
  const insetTop = inset ? insets.top : 0;
  const barBand = insetTop + barHeight;
  const { collapsed, largeHeight, largeSize, measureLarge, offset, progress } =
    model;
  const context = useMemo<ScrollHeaderContextValue>(
    () => ({
      barBand,
      collapsed,
      hasLarge: largeSize >= 1,
      insetTop,
      largeHeight,
      measureLarge,
      offset,
      progress,
    }),
    [
      collapsed,
      largeHeight,
      largeSize,
      measureLarge,
      offset,
      progress,
      barBand,
      insetTop,
    ]
  );
  const parts = splitChildren(children);
  return (
    <ScrollHeaderContext.Provider value={context}>
      <View
        {...native}
        ref={ref}
        className={scrollHeaderVariants().root({ className })}
        style={mergeStyle({ minHeight: 0, position: "relative" }, style)}
      >
        {parts.scrollable ? (
          <HeaderScrollable
            child={parts.scrollable}
            size={largeSize}
            snap={snap}
          />
        ) : null}
        <HeaderBand context={context} stretch={stretch} reduced={model.reduced}>
          {parts.cover}
          {parts.large}
          {parts.bar}
        </HeaderBand>
      </View>
    </ScrollHeaderContext.Provider>
  );
});
ScrollHeaderRoot.displayName = "ScrollHeader";
export const ScrollHeader = Object.assign(ScrollHeaderRoot, {
  Actions: ScrollHeaderActions,
  Bar: ScrollHeaderBar,
  Cover: ScrollHeaderCover,
  Description: ScrollHeaderDescription,
  Large: ScrollHeaderLarge,
  Title: ScrollHeaderTitle,
});
