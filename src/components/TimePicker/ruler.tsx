import { CustomWrapper, ScrollView, View } from "@tarojs/components";
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { formatTime } from "../../lib/time";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { TICK_SPACING } from "./constants";
import { boundedTimes, nearestTimeIndex } from "./math";
import { rulerWindow } from "./ruler-window";
import type { FaceProps } from "./types";
import { useSnap } from "./use-snap";
import { timePickerVariants } from "./variants";

export const RulerFace = ({
  value,
  onValueChange,
  syncToken,
  hourCycle,
  minuteStep,
  minTime,
  maxTime,
  locale,
  disabled,
  readout = "default",
}: FaceProps) => {
  const slots = timePickerVariants({ readout });
  const times = useMemo(
    () => boundedTimes(minuteStep, minTime, maxTime),
    [minuteStep, minTime, maxTime]
  );
  const index = nearestTimeIndex(times, value);
  const scrolling = useSnap(
    index,
    times.length,
    TICK_SPACING,
    syncToken,
    disabled,
    (next) => {
      if (times[next]) {
        onValueChange(times[next]);
      }
    },
    times.map((time) => `${time.hour}:${time.minute}`).join("\0")
  );
  const readWindow = useCallback(
    () =>
      rulerWindow(
        times.length,
        Math.round(scrolling.signal.value / TICK_SPACING)
      ).start,
    [times.length, scrolling.signal]
  );
  const start = useSyncExternalStore(
    scrolling.signal.subscribe,
    readWindow,
    readWindow
  );
  const visible = { end: Math.min(times.length, start + 121), start };
  const measure = useElementLayout(true, minuteStep, undefined, false);
  useEffect(() => {
    if (measure.layout?.width) {
      scrolling.relayout();
    }
  }, [measure.layout?.width, scrolling.relayout]);
  const pad = Math.max(
    0,
    ((measure.layout?.width ?? 0) * scrolling.pixelScale) / 2 -
      scrolling.pixelSpacing / 2
  );
  const stepsPerHour = Math.max(1, Math.round(60 / minuteStep));
  return (
    <View
      className={cn(
        "flex flex-col",
        readout === "none" ? undefined : "gap-[32px]"
      )}
    >
      {readout === "none" ? null : (
        <Text className={slots.readout()}>
          {formatTime(value, { hourCycle, locale })}
        </Text>
      )}
      <View id={measure.id} className="relative h-[112px] justify-center">
        <CustomWrapper>
          <ScrollView
            id={scrolling.id}
            className="panel-time-ruler"
            enhanced
            scrollX={!disabled}
            bounces={false}
            showScrollbar={false}
            scrollLeft={scrolling.position}
            scrollWithAnimation={false}
            style={{ height: "112rpx", width: "100%" }}
            aria-label="Time"
            aria-disabled={disabled}
            aria-valuetext={formatTime(value, { hourCycle, locale })}
            onTouchStart={scrolling.start}
            onTouchEnd={scrolling.release}
            onTouchCancel={scrolling.abort}
            onDragStart={scrolling.start}
            onDragEnd={scrolling.release}
            onScroll={scrolling.onScroll}
            onScrollEnd={() => {
              void scrolling.finish();
            }}
            onLongPress={() => {
              void scrolling.adjust();
            }}
          >
            <CustomWrapper>
              <View
                className="flex flex-row"
                style={{
                  height: "112rpx",
                  paddingLeft: `${pad}px`,
                  paddingRight: `${pad}px`,
                  width: `${times.length * scrolling.pixelSpacing + pad * 2}px`,
                }}
              >
                <View
                  style={{
                    flexShrink: 0,
                    width: `${visible.start * scrolling.pixelSpacing}px`,
                  }}
                />
                {times.slice(visible.start, visible.end).map((_, position) => {
                  const at = visible.start + position;
                  return (
                    <View
                      key={at}
                      style={{
                        flexShrink: 0,
                        width: `${scrolling.pixelSpacing}px`,
                      }}
                      className="flex flex-col items-center justify-center"
                    >
                      <View
                        className={cn(
                          "w-[4px] rounded-full",
                          at % stepsPerHour === 0
                            ? "h-[56px] bg-[color:var(--panel-muted-foreground)]"
                            : "h-[32px] bg-[color:var(--panel-border)]"
                        )}
                      />
                    </View>
                  );
                })}
                <View
                  style={{
                    flexShrink: 0,
                    width: `${(times.length - visible.end) * scrolling.pixelSpacing}px`,
                  }}
                />
              </View>
            </CustomWrapper>
          </ScrollView>
        </CustomWrapper>
        <View
          className="absolute inset-y-[8px] left-1/2 w-[4px] -translate-x-[2px] rounded-full bg-[color:var(--panel-primary)]"
          style={{ pointerEvents: "none" }}
        />
      </View>
    </View>
  );
};
