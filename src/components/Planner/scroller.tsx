import { ScrollView, View } from "@tarojs/components";
import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useMemo, useRef, useState } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { startOfCalendarMonth, weekdayNames } from "../../lib/date";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { DEFAULT_SCROLLER_WEEKS, DEFAULT_WEEK_HEIGHT } from "./constants";
import { usePlanner } from "./context";
import { PlannerDay } from "./grid";
import { weekAnchor, weekDays, weekIndex, weekRange } from "./planner-weeks";
import type { PlannerScrollerProps } from "./types";
import { plannerVariants } from "./variants";

export const PlannerScroller = ({
  className,
  weeks: span = DEFAULT_SCROLLER_WEEKS,
  rowHeight = DEFAULT_WEEK_HEIGHT,
  renderDay,
}: PlannerScrollerProps) => {
  const { month, syncMonth, weekStartsOn, locale, variant, system } =
    usePlanner("Planner.Scroller");
  const [anchor] = useState(() => month);
  const range = useMemo(
    () => weekRange(anchor, weekStartsOn, span, span),
    [anchor, weekStartsOn, span]
  );
  const headings = useMemo(
    () => weekdayNames(locale, weekStartsOn, "narrow"),
    [locale, weekStartsOn]
  );
  const initial =
    Math.max(0, weekIndex(range, month, weekStartsOn)) * rowHeight;
  const [position, setPosition] = useState(initial);
  const [requested, setRequested] = useState(
    (initial * getWindowInfo().windowWidth) / 375
  );
  const reported = useRef(month.getTime());
  const viewport = useElementLayout(true, range);
  const latest = useRef({ locale, syncMonth, system });
  latest.current = { locale, syncMonth, system };
  useEffect(() => {
    if (month.getTime() === reported.current) {
      return;
    }
    reported.current = month.getTime();
    const index = weekIndex(range, month, weekStartsOn);
    if (index >= 0) {
      setRequested((index * rowHeight * getWindowInfo().windowWidth) / 375);
    }
  }, [month, range, weekStartsOn, rowHeight]);
  const height = viewport.layout?.height ?? 384;
  const first = Math.max(0, Math.floor(position / rowHeight) - 6);
  const last = Math.min(
    range.length,
    Math.ceil((position + height) / rowHeight) + 6
  );
  const { week: weekRow, heading } = plannerVariants();
  return (
    <View className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <View aria-hidden className={cn(weekRow(), "px-[8px] pb-[8px]")}>
        {headings.map((label, index) => (
          <Text key={index} size="xs" muted className={heading()}>
            {label.toUpperCase()}
          </Text>
        ))}
      </View>
      <ScrollView
        id={viewport.id}
        scrollY
        enhanced
        showScrollbar={false}
        className="min-h-0 flex-1"
        scrollTop={requested}
        scrollWithAnimation
        onScroll={(event) => {
          const y =
            (event.detail.scrollTop * 375) / getWindowInfo().windowWidth;
          setPosition(y);
          let index = Math.floor(y / rowHeight);
          if (1 - (y % rowHeight) / rowHeight < 0.6) {
            index += 1;
          }
          const week = range[index];
          if (!week) {
            return;
          }
          const next = startOfCalendarMonth(
            weekAnchor(week),
            latest.current.system,
            latest.current.locale
          );
          if (next.getTime() === reported.current) {
            return;
          }
          reported.current = next.getTime();
          latest.current.syncMonth(next);
        }}
      >
        <View aria-hidden style={{ height: `${first * rowHeight * 2}rpx` }} />
        {range.slice(first, last).map((item) => (
          <View
            key={item.getTime()}
            className={cn(
              weekRow(),
              "border-t-[2px] border-solid border-[var(--panel-border)] px-[8px]",
              variant === "calendar" && "items-stretch"
            )}
            style={{ height: `${rowHeight * 2}rpx` }}
          >
            {weekDays(item).map((date) => (
              <PlannerDay
                key={date.getTime()}
                date={date}
                renderDay={renderDay}
              />
            ))}
          </View>
        ))}
        <View
          aria-hidden
          style={{
            height: `${Math.max(0, range.length - last) * rowHeight * 2}rpx`,
          }}
        />
      </ScrollView>
    </View>
  );
};
PlannerScroller.displayName = "Planner.Scroller";
