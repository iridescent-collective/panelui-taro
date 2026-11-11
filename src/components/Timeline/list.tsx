import { ScrollView, View } from "@tarojs/components";
import { cloneElement, useMemo } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import {
  TimelineContext,
  TimelineColumnOffsetContext,
  useScrollValue,
} from "./context";
import {
  TIMELINE_WIDE_COLUMN,
  timelineColumnWidth,
  timelineColumnOffsets,
  timelineMountRange,
} from "./geometry";
import type { TimelineListProps } from "./types";
import { useTimelineScroll } from "./use-scroll";
import { timelineVariants } from "./variants";

const separators = {
  highlight: () => false,
  unhighlight: () => false,
  updateProps: () => false,
};
export const TimelineList = <T,>({
  data,
  renderItem,
  itemWidth: requestedWidth = TIMELINE_WIDE_COLUMN,
  value = 0,
  variant = "dot",
  snap = true,
  initialNumToRender = 6,
  maxToRenderPerBatch = 6,
  windowSize = 5,
  className,
  keyExtractor,
  ...props
}: TimelineListProps<T>) => {
  const reduced = usePanelReducedMotion();
  const layout = useElementLayout(true, data, props.id);
  const widths = useMemo(
    () =>
      data.map((item, index) =>
        timelineColumnWidth(
          typeof requestedWidth === "function"
            ? requestedWidth(item, index)
            : requestedWidth,
          true
        )
      ),
    [data, requestedWidth]
  );
  const offsets = useMemo(() => timelineColumnOffsets(widths), [widths]);
  const total = widths.reduce((sum, width) => sum + width, 0);
  const scroll = useTimelineScroll(offsets, snap);
  const x = useScrollValue(scroll.signal);
  const range = timelineMountRange(
    offsets,
    widths,
    x,
    layout.layout?.width ?? 375,
    windowSize,
    Math.max(initialNumToRender, maxToRenderPerBatch)
  );
  const context = useMemo(
    () => ({
      activeStep: value,
      animate: !reduced,
      offsets,
      orientation: "horizontal" as const,
      scrollX: scroll.signal,
      variant,
      virtualized: true,
    }),
    [value, variant, scroll.signal, offsets, reduced]
  );
  const { root } = timelineVariants({ orientation: "horizontal", variant });
  return (
    <TimelineContext.Provider value={context}>
      <ScrollView
        {...props}
        id={props.id ?? layout.id}
        className={root({ className })}
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
          role="list"
          aria-role="list"
          className="relative flex flex-row"
          style={{ width: `${total * 2}rpx` }}
        >
          <View
            aria-hidden
            className="shrink-0"
            style={{ width: `${(offsets[range.start] ?? total) * 2}rpx` }}
          />
          {data.slice(range.start, range.end).map((item, local) => {
            const index = local + range.start;
            return (
              <TimelineColumnOffsetContext.Provider
                key={keyExtractor?.(item, index) ?? index}
                value={offsets[index] ?? 0}
              >
                {cloneElement(renderItem({ index, item, separators }), {
                  last: index === data.length - 1,
                  role: "listitem",
                  step: index,
                  width: widths[index],
                })}
              </TimelineColumnOffsetContext.Provider>
            );
          })}
          <View
            aria-hidden
            className="shrink-0"
            style={{
              width: `${Math.max(0, total - (offsets[range.end] ?? total)) * 2}rpx`,
            }}
          />
        </View>
      </ScrollView>
    </TimelineContext.Provider>
  );
};
TimelineList.displayName = "Timeline.List";
