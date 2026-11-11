import { CustomWrapper, ScrollView, View } from "@tarojs/components";
import { useEffect, useMemo, useState } from "react";

import { useNativeScrollMetrics } from "../../hooks/use-native-scroll-metrics";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../../icons";
import {
  addCalendarMonths,
  calendarMonthLabel,
  calendarMonthNames,
  calendarParts,
  isBefore,
  isAfter,
  startOfCalendarMonth,
} from "../../lib/date";
import { cn } from "../../lib/utils";
import { AnimatedPressable as Pressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Popover } from "../Popover";
import { Text } from "../primitives/Text";
import { useCalendar } from "./context";
import type { CalendarHeaderProps, CalendarNavProps } from "./types";
import { useCaptionScroll } from "./use-caption-scroll";
import { calendarVariants } from "./variants";

export const CalendarNav = ({
  direction,
  disabled = false,
  onPress,
}: CalendarNavProps) => {
  const { nav } = calendarVariants();
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={
        direction === "next" ? "Next month" : "Previous month"
      }
      accessibilityState={{ disabled }}
      className={cn(
        nav(),
        disabled ? "opacity-30" : "active:bg-[var(--panel-accent)]"
      )}
    >
      {direction === "next" ? (
        <ChevronRightIcon size={18} />
      ) : (
        <ChevronLeftIcon size={18} />
      )}
    </Pressable>
  );
};
const OPTION_HEIGHT = 40;
const LIST_MAX_HEIGHT = OPTION_HEIGHT * 6.5;
const CaptionChip = ({
  label,
  expanded,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  expanded: boolean;
  accessibilityLabel: string;
  onPress?: (...args: unknown[]) => void;
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ expanded }}
    className="flex flex-row items-center gap-[8px] rounded-[var(--panel-radius-lg)] px-[16px] py-[12px] active:bg-[var(--panel-accent)]"
  >
    <Text weight="semibold">{label}</Text>

    <ChevronDownIcon size={14} />
  </Pressable>
);
// Rows stay outside the popup motion updates; native scroll position is unbound.
const CaptionOptions = ({
  options,
  active,
  id,
  height,
  pixelSpacing,
  onContentReady,
  onTouchStart,
  onSelect,
}: {
  options: string[];
  active: number;
  id: string;
  height: number;
  pixelSpacing: number;
  onContentReady: () => void;
  onTouchStart: () => void;
  onSelect: (index: number) => void;
}) => {
  const tick = useThemeToken("foreground");
  // Initialize alongside popup measurement, before its entrance starts.
  useEffect(onContentReady, [onContentReady]);
  return (
    <CustomWrapper>
      <ScrollView
        panelui-native-scroll="true"
        id={id}
        scrollY
        enhanced
        onTouchStart={onTouchStart}
        onDragStart={onTouchStart}
        scrollWithAnimation={false}
        bounces={false}
        showScrollbar={false}
        style={{ height: `${height}px` }}
      >
        {options.map((option, index) => {
          const selected = index === active;
          return (
            <View
              key={option}
              onClick={() => onSelect(index)}
              role="button"
              aria-role="button"
              aria-selected={selected}
              style={{ height: `${pixelSpacing}px` }}
              className={cn(
                "flex flex-row items-center justify-between gap-[16px] rounded-[var(--panel-radius-xl)] px-[24px]",
                selected
                  ? "bg-[var(--panel-accent)]"
                  : "active:bg-[var(--panel-accent)]"
              )}
            >
              <Text size="sm" weight={selected ? "semibold" : "normal"}>
                {option}
              </Text>
              {selected ? <CheckIcon size={16} color={tick} /> : null}
            </View>
          );
        })}
      </ScrollView>
    </CustomWrapper>
  );
};
const CaptionDropdown = ({
  label,
  accessibilityLabel,
  options,
  active,
  width,
  onSelect,
}: {
  label: string;
  accessibilityLabel: string;
  options: string[];
  active: number;
  width: number;
  onSelect: (index: number) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { pixelSpacing } = useNativeScrollMetrics(OPTION_HEIGHT);
  const height =
    Math.min(options.length, LIST_MAX_HEIGHT / OPTION_HEIGHT) * pixelSpacing;
  const initialOffset = Math.min(
    Math.max(0, options.length * pixelSpacing - height),
    Math.max(0, active * pixelSpacing - height / 2 + pixelSpacing / 2)
  );
  const scrolling = useCaptionScroll(initialOffset, open && active >= 0);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) scrolling.interrupt();
        setOpen(next);
      }}
    >
      <Popover.Trigger>
        <CaptionChip
          label={label}
          expanded={open}
          accessibilityLabel={accessibilityLabel}
        />
      </Popover.Trigger>
      <Popover.Content
        overshootClamping
        align="center"
        width={width}
        className="p-[12px]"
        onLayout={scrolling.initialize}
      >
        <CaptionOptions
          options={options}
          active={active}
          id={scrolling.id}
          height={height}
          pixelSpacing={pixelSpacing}
          onContentReady={scrolling.initialize}
          onTouchStart={scrolling.interrupt}
          onSelect={(index) => {
            scrolling.interrupt();
            onSelect(index);
            setOpen(false);
          }}
        />
      </Popover.Content>
    </Popover>
  );
};
const MONTH_LIST_WIDTH = 176;
const YEAR_LIST_WIDTH = 132;
const CalendarDropdowns = ({
  month,
  offset,
}: {
  month: Date;
  offset: number;
}) => {
  const { setMonth, locale, system, minDate, maxDate, startMonth, endMonth } =
    useCalendar("Calendar.Caption");
  const months = useMemo(
    () => calendarMonthNames(month, system, locale, "short"),
    [month, system, locale]
  );
  const current = calendarParts(month, system, locale);
  const first = startMonth ?? minDate;
  const last = endMonth ?? maxDate;
  const firstParts = first ? calendarParts(first, system, locale) : null;
  const lastParts = last ? calendarParts(last, system, locale) : null;
  const bounds = {
    from: firstParts ? firstParts.year : current.year - 100,
    to: lastParts ? lastParts.year : current.year + 10,
  };
  const monthOptions = months
    .map((label, index) => ({ label, month: index + 1 }))
    .filter(({ month: candidateMonth }) => {
      if (
        firstParts &&
        current.year === firstParts.year &&
        candidateMonth < firstParts.month
      ) {
        return false;
      }
      if (
        lastParts &&
        current.year === lastParts.year &&
        candidateMonth > lastParts.month
      ) {
        return false;
      }
      return true;
    });
  const years = Array.from(
    { length: Math.max(1, bounds.to - bounds.from + 1) },
    (_unused, index) => bounds.from + index
  );
  const choose = (months_: number) => {
    setMonth(addCalendarMonths(month, months_ - offset, system, locale));
  };
  return (
    <>
      <CaptionDropdown
        label={months[current.month - 1] ?? String(current.month)}
        accessibilityLabel="Month"
        options={monthOptions.map((option) => option.label)}
        active={monthOptions.findIndex(
          (option) => option.month === current.month
        )}
        width={MONTH_LIST_WIDTH}
        onSelect={(index) =>
          choose((monthOptions[index]?.month ?? current.month) - current.month)
        }
      />
      <CaptionDropdown
        label={String(current.year)}
        accessibilityLabel="Year"
        options={years.map(String)}
        active={years.indexOf(current.year)}
        width={YEAR_LIST_WIDTH}
        onSelect={(index) =>
          choose(((years[index] ?? current.year) - current.year) * 12)
        }
      />
    </>
  );
};
export const CalendarHeader = ({
  offset = 0,
  lastOffset = 0,
}: CalendarHeaderProps) => {
  const {
    month,
    setMonth,
    locale,
    system,
    minDate,
    maxDate,
    startMonth,
    endMonth,
    captionLayout,
  } = useCalendar("Calendar.Header");
  const { header, caption } = calendarVariants();
  const shown = addCalendarMonths(month, offset, system, locale);
  const lower = startMonth ?? minDate;
  const upper = endMonth ?? maxDate;
  const canGoBack =
    !lower || isBefore(startOfCalendarMonth(lower, system, locale), month);
  const canGoForward =
    !upper || isAfter(startOfCalendarMonth(upper, system, locale), shown);
  return (
    <View className={header()}>
      {offset === 0 ? (
        <CalendarNav
          direction="previous"
          disabled={!canGoBack}
          onPress={() => setMonth(addCalendarMonths(month, -1, system, locale))}
        />
      ) : (
        <View className="h-[64px] w-[64px]" />
      )}

      <View className={caption()}>
        {captionLayout === "dropdown" ? (
          <CalendarDropdowns month={shown} offset={offset} />
        ) : (
          <Text weight="semibold" className="text-[32px] leading-[1.5]">
            {calendarMonthLabel(shown, system, locale)}
          </Text>
        )}
      </View>

      {offset === lastOffset ? (
        <CalendarNav
          direction="next"
          disabled={!canGoForward}
          onPress={() => setMonth(addCalendarMonths(month, 1, system, locale))}
        />
      ) : (
        <View className="h-[64px] w-[64px]" />
      )}
    </View>
  );
};
