import { ScrollView, View } from "@tarojs/components";
import { Children, forwardRef, isValidElement, useMemo } from "react";
import type { ComponentRef, ReactElement } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useThemeToken } from "../../theme/use-theme";
import { textChildren } from "../primitives/Text";
import { HORIZONTAL_RAIL_TOP } from "./constants";
import { TimelineContext, TimelineColumnOffsetContext } from "./context";
import { itemWidth, timelineColumnOffsets } from "./geometry";
import { TimelineItem } from "./parts";
import type { TimelineProps, TimelineItemProps } from "./types";
import { useTimelineScroll } from "./use-scroll";
import { timelineVariants } from "./variants";

export const TimelineRoot = forwardRef<
  ComponentRef<typeof View>,
  TimelineProps
>(
  (
    {
      className,
      value = 0,
      variant = "dot",
      orientation = "vertical",
      snap = true,
      haptics = false,
      onColumnChange,
      children,
      ...props
    },
    ref
  ) => {
    const horizontal = orientation === "horizontal";
    const reduced = usePanelReducedMotion();
    const border = useThemeToken("border");
    const columns = useMemo(() => {
      if (!horizontal) {
        return { children, offsets: [], total: 0 };
      }
      const items: ReactElement<TimelineItemProps>[] = [];
      Children.forEach(children, (child) => {
        if (isValidElement(child) && child.type === TimelineItem) {
          items.push(child as ReactElement<TimelineItemProps>);
        }
      });
      const widths = items.map((item) => itemWidth(item.props));
      const offsets = timelineColumnOffsets(widths);
      let position = 0;
      const rendered = Children.map(children, (child) => {
        if (!isValidElement(child) || child.type !== TimelineItem) {
          return child;
        }
        const offset = offsets[position] ?? 0;
        position += 1;
        return (
          <TimelineColumnOffsetContext.Provider value={offset}>
            {child}
          </TimelineColumnOffsetContext.Provider>
        );
      });
      return {
        children: rendered,
        offsets,
        total: widths.reduce((sum, width) => sum + width, 0),
      };
    }, [children, horizontal]);
    const scroll = useTimelineScroll(
      columns.offsets,
      horizontal && snap,
      horizontal && haptics,
      horizontal ? onColumnChange : undefined
    );
    const context = useMemo(
      () => ({
        activeStep: value,
        animate: !reduced,
        offsets: columns.offsets,
        orientation,
        scrollX: scroll.signal,
        variant,
        virtualized: false,
      }),
      [value, variant, orientation, scroll.signal, columns.offsets, reduced]
    );
    const { root } = timelineVariants({ orientation, variant });
    return (
      <TimelineContext.Provider value={context}>
        <View ref={ref} className={root({ className })} {...props}>
          {horizontal ? (
            <ScrollView
              scrollX
              enhanced
              showScrollbar={false}
              scrollWithAnimation
              scrollLeft={scroll.scrollLeft}
              onScroll={scroll.onScroll}
              onScrollEnd={scroll.onScrollEnd}
              onTouchStart={scroll.onTouchStart}
              onTouchEnd={scroll.onTouchEnd}
              onTouchCancel={scroll.onTouchCancel}
            >
              <View
                className="relative flex flex-row"
                style={{ width: `${columns.total * 2}rpx` }}
              >
                <View
                  aria-hidden
                  className="pointer-events-none absolute right-0 left-0"
                  style={{
                    borderColor: border,
                    borderStyle: "dashed",
                    borderTopWidth: "2rpx",
                    top: `${HORIZONTAL_RAIL_TOP * 2}rpx`,
                  }}
                />
                {textChildren(columns.children)}
              </View>
            </ScrollView>
          ) : (
            textChildren(children)
          )}
        </View>
      </TimelineContext.Provider>
    );
  }
);
TimelineRoot.displayName = "Timeline";
