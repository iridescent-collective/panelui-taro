import { View } from "@tarojs/components";
import { useCallback, useMemo, useState } from "react";

import {
  resolveCalendar,
  localeWeekStart,
  normalizeWeekStart,
  startOfCalendarMonth,
  clampDate,
  addCalendarMonths,
  isSameCalendarMonth,
  startOfDay,
  isSameDay,
  isBefore,
} from "../../lib/date";
import { cn } from "../../lib/utils";
import { CalendarHeader, CalendarNav } from "./caption";
import { CalendarContext } from "./context";
import { CalendarGrid, CalendarDay } from "./grid";
import type {
  CalendarMode,
  CalendarProps,
  CalendarSelection,
  DateRange,
} from "./types";
import { calendarVariants } from "./variants";

export type {
  CalendarMode,
  CalendarProps,
  CalendarSelection,
  DateRange,
  CalendarDisabled,
  CalendarCaptionLayout,
  CalendarHeaderProps,
  CalendarNavProps,
} from "./types";
const CalendarRoot = <Mode extends CalendarMode = "single">({
  className,
  mode = "single" as Mode,
  selected,
  defaultSelected,
  onSelect,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  numberOfMonths = 1,
  captionLayout = "label",
  disabled,
  minDate,
  maxDate,
  startMonth,
  endMonth,
  weekStartsOn: weekStartsOnProp = 0,
  showOutsideDays = true,
  selectOutsideDays = false,
  bordered = true,
  locale,
  calendar = "gregory",
  ...props
}: CalendarProps<Mode>) => {
  const system = useMemo(
    () => resolveCalendar(calendar, locale),
    [calendar, locale]
  );
  const weekStartsOn = useMemo(
    () =>
      weekStartsOnProp === "auto"
        ? localeWeekStart(locale)
        : normalizeWeekStart(weekStartsOnProp),
    [weekStartsOnProp, locale]
  );
  const [internalSelected, setInternalSelected] = useState<
    CalendarSelection[Mode] | undefined
  >(defaultSelected);
  const isControlled = selected !== undefined;
  const value = (
    isControlled ? selected : internalSelected
  ) as CalendarSelection[Mode];
  const [initialMonth] = useState(() => {
    if (defaultMonth) {
      return startOfCalendarMonth(defaultMonth, system, locale);
    }
    let first: Date | undefined;
    if (value instanceof Date) {
      first = value;
    } else if (Array.isArray(value)) {
      [first] = value;
    } else if (value && typeof value === "object" && "from" in value) {
      first = (value as DateRange).from;
    }
    return startOfCalendarMonth(first ?? new Date(), system, locale);
  });
  const [internalMonth, setInternalMonth] = useState(initialMonth);
  const monthInstant = monthProp?.getTime();
  const controlledMonth = useMemo(
    () =>
      monthInstant === undefined
        ? undefined
        : startOfCalendarMonth(new Date(monthInstant), system, locale),
    [monthInstant, system, locale]
  );
  const month = controlledMonth ?? internalMonth;
  const monthBounds = useMemo(() => {
    const lower = startMonth ?? minDate;
    const upper = endMonth ?? maxDate;
    return {
      from: lower ? startOfCalendarMonth(lower, system, locale) : undefined,
      to: upper ? startOfCalendarMonth(upper, system, locale) : undefined,
    };
  }, [startMonth, minDate, endMonth, maxDate, system, locale]);
  const setMonth = useCallback(
    (next: Date) => {
      const settled = clampDate(
        startOfCalendarMonth(next, system, locale),
        monthBounds.from,
        monthBounds.to
      );
      if (!monthProp) {
        setInternalMonth(settled);
      }
      onMonthChange?.(settled);
    },
    [monthProp, onMonthChange, system, locale, monthBounds]
  );
  const commit = useCallback(
    (next: CalendarSelection[Mode]) => {
      if (!isControlled) {
        setInternalSelected(next);
      }
      onSelect?.(next);
    },
    [isControlled, onSelect]
  );
  const select = useCallback(
    (date: Date) => {
      const day = startOfDay(date);
      if (!isSameCalendarMonth(day, month, system, locale)) {
        setMonth(day);
      }
      if (mode === "multiple") {
        const current = (value as Date[] | undefined) ?? [];
        const without = current.filter((picked) => !isSameDay(picked, day));
        const next =
          without.length === current.length ? [...current, day] : without;
        commit(next as CalendarSelection[Mode]);
        return;
      }
      if (mode === "range") {
        const current = value as DateRange | undefined;
        if (!current || current.to || isBefore(day, current.from)) {
          commit({ from: day } as CalendarSelection[Mode]);
        } else {
          commit({ from: current.from, to: day } as CalendarSelection[Mode]);
        }
        return;
      }
      const current = value as Date | undefined;
      commit(
        (isSameDay(current, day) ? undefined : day) as CalendarSelection[Mode]
      );
    },
    [mode, value, commit, month, system, locale, setMonth]
  );
  const context = useMemo(
    () => ({
      captionLayout,
      endMonth,
      locale,
      maxDate,
      minDate,
      month,
      setMonth,
      startMonth,
      system,
    }),
    [
      month,
      setMonth,
      locale,
      system,
      minDate,
      maxDate,
      startMonth,
      endMonth,
      captionLayout,
    ]
  );
  const { root } = calendarVariants({ bordered });
  const months = Math.max(
    1,
    Math.min(
      12,
      Number.isFinite(numberOfMonths) ? Math.trunc(numberOfMonths) : 1
    )
  );
  return (
    <CalendarContext.Provider value={context}>
      <View {...props} className={cn("flex flex-col", root(), className)}>
        {Array.from({ length: months }, (_unused, offset) => (
          <View
            key={addCalendarMonths(month, offset, system, locale).getTime()}
            className="flex flex-col gap-[16px]"
          >
            <CalendarHeader offset={offset} lastOffset={months - 1} />
            <CalendarGrid
              month={addCalendarMonths(month, offset, system, locale)}
              mode={mode}
              value={value}
              onSelect={select}
              disabled={disabled}
              minDate={minDate}
              maxDate={maxDate}
              weekStartsOn={weekStartsOn}
              showOutsideDays={showOutsideDays}
              selectOutsideDays={selectOutsideDays}
              locale={locale}
              system={system}
            />
          </View>
        ))}
      </View>
    </CalendarContext.Provider>
  );
};
CalendarRoot.displayName = "Calendar";
export const Calendar = Object.assign(CalendarRoot, {
  Day: CalendarDay,
  Grid: CalendarGrid,
  Header: CalendarHeader,
  Nav: CalendarNav,
});
