import { View } from "@tarojs/components";
import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useMemo,
  useState,
} from "react";
import type { ComponentRef } from "react";

import {
  calendarMonthLabel,
  isSameCalendarMonth,
  localeWeekStart,
  monthGrid,
  normalizeWeekStart,
  resolveCalendar,
  startOfCalendarMonth,
} from "../../lib/date";
import { cn } from "../../lib/utils";
import { Frame } from "../Frame";
import { Text } from "../primitives/Text";
import { DEFAULT_ENTRY_LIMIT, PALETTE_SIZE } from "./constants";
import { PlannerContext } from "./context";
import type { PlannerContextValue } from "./context";
import { PlannerHeader } from "./parts";
import { usePlannerMonthAnnouncement } from "./planner-announcement";
import { bucketByDay, summariseMonth } from "./planner-entries";
import {
  usePlannerMonthLifecycle,
  usePlannerSelectionLifecycle,
} from "./planner-lifecycle";
import type { PlannerProps } from "./types";
import { useToday, usePalette } from "./use-today";

export const PlannerRoot = forwardRef<ComponentRef<typeof View>, PlannerProps>(
  (
    {
      className,
      month: monthProp,
      defaultMonth,
      onMonthChange,
      entries = [],
      categories = [],
      selected: selectedProp,
      defaultSelected = null,
      onSelectedChange,
      onDayPress,
      variant = "default",
      fill = false,
      entryLimit,
      weekStartsOn = "auto",
      locale,
      calendar = "gregory",
      frame = true,
      children,
      ...props
    },
    ref
  ) => {
    const [announcement, setAnnouncement] = useState("");
    const resolvedEntryLimit = entryLimit ?? DEFAULT_ENTRY_LIMIT[variant];
    const system = resolveCalendar(calendar, locale);
    const palette = usePalette();
    const today = useToday();
    const settleMonth = useCallback(
      (date: Date) => startOfCalendarMonth(date, system, locale),
      [system, locale]
    );
    const [month, requestMonth] = usePlannerMonthLifecycle({
      defaultMonth,
      month: monthProp,
      onMonthChange,
      settleMonth,
    });
    const expectMonthAnnouncement = usePlannerMonthAnnouncement({
      announce: setAnnouncement,
      monthKey: month.getTime(),
      monthLabel: calendarMonthLabel(month, system, locale),
    });
    const syncMonth = useCallback(
      (next: Date) => {
        requestMonth(next);
      },
      [requestMonth]
    );
    const setMonth = useCallback(
      (next: Date) => {
        expectMonthAnnouncement(settleMonth(next));
        requestMonth(next);
      },
      [expectMonthAnnouncement, requestMonth, settleMonth]
    );
    const [selected, select] = usePlannerSelectionLifecycle({
      defaultSelected,
      onSelectedChange,
      selected: selectedProp,
    });
    const days = useMemo(() => bucketByDay(entries), [entries]);
    const normalizedWeekStart =
      weekStartsOn === "auto"
        ? localeWeekStart(locale)
        : normalizeWeekStart(weekStartsOn);
    const grid = useMemo(
      () => monthGrid(month, normalizedWeekStart, system, locale),
      [month, normalizedWeekStart, system, locale]
    );
    const isInMonth = useCallback(
      (date: Date) => isSameCalendarMonth(date, month, system, locale),
      [month, system, locale]
    );
    const categoryLabels = useMemo(
      () =>
        new Map(categories.map((category) => [category.id, category.label])),
      [categories]
    );
    const categoryColors = useMemo(() => {
      const colors = new Map<string, string | undefined>();
      for (const [index, category] of categories.entries()) {
        if (colors.has(category.id)) {
          continue;
        }
        const slot = (category.colorIndex ?? index + 1) - 1;
        colors.set(
          category.id,
          category.color ??
            palette[((slot % PALETTE_SIZE) + PALETTE_SIZE) % PALETTE_SIZE]
        );
      }
      return colors;
    }, [categories, palette]);
    const colorOf = useCallback(
      (id: string | undefined) => (id ? categoryColors.get(id) : undefined),
      [categoryColors]
    );
    const summary = useMemo(
      () => summariseMonth(days, grid, categories, isInMonth),
      [days, grid, categories, isInMonth]
    );
    const context = useMemo<PlannerContextValue>(
      () => ({
        categories,
        categoryLabels,
        colorOf,
        days,
        entryLimit: resolvedEntryLimit,
        fill,
        grid,
        isInMonth,
        locale,
        month,
        onDayPress,
        select,
        selected,
        setMonth,
        summary,
        syncMonth,
        system,
        today,
        variant,
        weekStartsOn: normalizedWeekStart,
      }),
      [
        month,
        setMonth,
        syncMonth,
        today,
        selected,
        select,
        days,
        categories,
        categoryLabels,
        colorOf,
        summary,
        resolvedEntryLimit,
        variant,
        fill,
        normalizedWeekStart,
        grid,
        locale,
        system,
        isInMonth,
        onDayPress,
      ]
    );
    const parts = Children.toArray(children);
    const header = parts.find(
      (child) => isValidElement(child) && child.type === PlannerHeader
    );
    const body = parts.filter((child) => child !== header);
    return (
      <PlannerContext.Provider value={context}>
        {frame ? (
          <Frame
            ref={ref}
            className={cn("w-full", fill && "flex-1", className)}
            {...props}
          >
            {header}
            <Frame.Panel
              dividers={false}
              className={fill ? "flex-1" : undefined}
            >
              {body}
            </Frame.Panel>
          </Frame>
        ) : (
          <View
            ref={ref}
            className={cn("w-full", fill && "flex-1", className)}
            {...props}
          >
            {header}
            {body}
          </View>
        )}
        <Text aria-live="polite" className="sr-only">
          {announcement}
        </Text>
      </PlannerContext.Provider>
    );
  }
);
