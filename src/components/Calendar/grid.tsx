import { View } from "@tarojs/components";
import { useMemo } from "react";

import {
  monthGrid,
  weekdayNames,
  isSameCalendarMonth,
  isSameDay,
  isWithin,
  calendarLongDate,
  calendarDayNumber,
  isBefore,
  isAfter,
  startOfDay,
} from "../../lib/date";
import { AnimatedPressable as Pressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { dayVariants } from "./day-variants";
import type { CalendarDisabled, DateRange, GridProps, DayProps } from "./types";
import { useToday } from "./use-today";

const DAY_RADIUS = 8;
const isDisabled = (
  date: Date,
  disabled: CalendarDisabled | undefined,
  minDate: Date | undefined,
  maxDate: Date | undefined
): boolean => {
  if (minDate && isBefore(date, startOfDay(minDate))) {
    return true;
  }
  if (maxDate && isAfter(date, startOfDay(maxDate))) {
    return true;
  }
  if (!disabled) {
    return false;
  }
  if (typeof disabled === "function") {
    return disabled(date);
  }
  if (Array.isArray(disabled)) {
    return disabled.some((day) => isSameDay(day, date));
  }
  return isWithin(date, disabled.from, disabled.to);
};
export const CalendarDay = ({
  date,
  outside,
  selected,
  inRange,
  rangeStart = false,
  rangeEnd = false,
  today,
  disabled,
  openStart,
  openEnd,
  locale,
  system,
  onPress,
}: DayProps) => {
  const styles = dayVariants({
    disabled,
    fadedBand: disabled && inRange,
    outside,
    selected,
    today: today && !selected,
  });
  const bandStyle = inRange
    ? {
        borderBottomLeftRadius: openStart ? 0 : `${DAY_RADIUS * 2}rpx`,
        borderBottomRightRadius: openEnd ? 0 : `${DAY_RADIUS * 2}rpx`,
        borderTopLeftRadius: openStart ? 0 : `${DAY_RADIUS * 2}rpx`,
        borderTopRightRadius: openEnd ? 0 : `${DAY_RADIUS * 2}rpx`,
        left: rangeStart ? ("50%" as const) : 0,
        right: rangeEnd ? ("50%" as const) : 0,
      }
    : null;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={calendarLongDate(date, system, locale)}
      accessibilityState={{ disabled, selected }}
      className={styles.cell({ className: "relative flex flex-col" })}
    >
      {bandStyle ? <View className={styles.band()} style={bandStyle} /> : null}
      <View className={styles.disc({ className: "relative flex flex-col" })}>
        <Text className={styles.label()}>
          {calendarDayNumber(date, system, locale)}
        </Text>
      </View>
    </Pressable>
  );
};
export const CalendarGrid = ({
  month,
  mode,
  value,
  onSelect,
  disabled,
  minDate,
  maxDate,
  weekStartsOn,
  showOutsideDays,
  selectOutsideDays = false,
  locale,
  system,
}: GridProps) => {
  const weeks = useMemo(
    () => monthGrid(month, weekStartsOn, system, locale),
    [month, weekStartsOn, system, locale]
  );
  const headings = useMemo(
    () => weekdayNames(locale, weekStartsOn),
    [locale, weekStartsOn]
  );
  const today = useToday();
  const range = mode === "range" ? (value as DateRange | undefined) : undefined;
  const multiple =
    mode === "multiple" ? ((value as Date[] | undefined) ?? []) : [];
  const single = mode === "single" ? (value as Date | undefined) : undefined;
  return (
    <View role="list" aria-role="list" className="flex flex-col gap-[8px]">
      <View className="flex flex-row">
        {headings.map((heading) => (
          <Text key={heading} size="xs" muted className="flex-1 text-center">
            {heading}
          </Text>
        ))}
      </View>

      {weeks.map((week) => (
        <View key={week[0]?.getTime()} className="flex flex-row">
          {week.map((date, dayIndex) => {
            const outside = !isSameCalendarMonth(date, month, system, locale);
            if (outside && !showOutsideDays) {
              return <View key={date.getTime()} className="h-[80px] flex-1" />;
            }
            const isStart = mode === "range" && isSameDay(date, range?.from);
            const isEnd = mode === "range" && isSameDay(date, range?.to);
            let selected = isSameDay(date, single);
            if (mode === "range") {
              selected = isStart || isEnd;
            } else if (mode === "multiple") {
              selected = multiple.some((picked) => isSameDay(picked, date));
            }
            const inRange = !!range?.to && isWithin(date, range.from, range.to);
            const openStart = inRange && !isStart && dayIndex > 0;
            const openEnd = inRange && !isEnd && dayIndex < 6;
            const ruledOut =
              isDisabled(date, disabled, minDate, maxDate) ||
              (outside && !selectOutsideDays);
            return (
              <CalendarDay
                key={date.getTime()}
                date={date}
                outside={outside}
                selected={selected}
                inRange={inRange}
                rangeStart={isStart}
                rangeEnd={isEnd}
                today={isSameDay(date, today)}
                disabled={ruledOut}
                openStart={openStart}
                openEnd={openEnd}
                locale={locale}
                system={system}
                onPress={() => onSelect(date)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};
