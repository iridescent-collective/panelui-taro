import { View } from "@tarojs/components";
import { useMemo } from "react";

import type { DateLocale } from "../../lib/date";
import {
  calendarDayNumber,
  calendarLongDate,
  isSameDay,
  weekdayNames,
} from "../../lib/date";
import { cn } from "../../lib/utils";
import { AnimatedPressable as Pressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { TILE_TINT_OPACITY, TILE_GRID_HEIGHT } from "./constants";
import { usePlanner } from "./context";
import { dayVariants } from "./day-variants";
import {
  dayAccessibilityLabel,
  entriesOn,
  visibleEntries,
} from "./planner-entries";
import type {
  PlannerEntry,
  PlannerVariant,
  PlannerGridProps,
  PlannerDayProps,
} from "./types";
import { plannerVariants } from "./variants";

export const markerColor = (
  entries: readonly PlannerEntry[],
  colorOf: (category: string | undefined) => string | undefined
): string | undefined => {
  for (const entry of entries) {
    const color = entry.color ?? colorOf(entry.category);
    if (color) {
      return color;
    }
  }
  return undefined;
};
export const PlannerChip = ({
  entry,
  color,
}: {
  entry: PlannerEntry;
  color?: string;
}) => {
  const { chip } = dayVariants();
  return (
    <View
      className={chip()}
      style={color ? { backgroundColor: color } : undefined}
    >
      <Text
        size="xs"
        numberOfLines={1}
        className={cn(
          "leading-tight",
          !color && "text-[color:var(--panel-foreground)]"
        )}
        style={color ? { color: "#ffffff" } : undefined}
      >
        {entry.label}
      </Text>
    </View>
  );
};
const PlannerDayNumber = ({
  variant,
  date,
  isToday,
  styles,
  system,
  locale,
}: {
  variant: PlannerVariant;
  date: Date;
  isToday: boolean;
  styles: ReturnType<typeof dayVariants>;
  system: "gregory" | "islamic";
  locale: DateLocale;
}) => {
  if (variant === "tiles") {
    return (
      <View className={styles.corner()} aria-hidden>
        <Text size="xs" className={styles.number()}>
          {calendarDayNumber(date, system, locale)}
        </Text>
      </View>
    );
  }
  if (variant === "calendar") {
    return (
      <View
        className={cn(
          "flex h-[48px] w-[48px] flex-col items-center justify-center self-center rounded-full",
          isToday && "bg-[var(--panel-primary)]"
        )}
      >
        <Text
          size="xs"
          className={cn(
            styles.number(),
            isToday && "text-[color:var(--panel-primary-foreground)]"
          )}
        >
          {calendarDayNumber(date, system, locale)}
        </Text>
      </View>
    );
  }
  return (
    <Text className={styles.number()}>
      {calendarDayNumber(date, system, locale)}
    </Text>
  );
};
export const PlannerDay = ({ date, renderDay }: PlannerDayProps) => {
  const {
    days,
    today,
    selected,
    select,
    colorOf,
    categoryLabels,
    entryLimit,
    variant,
    fill,
    locale,
    system,
    isInMonth,
    onDayPress,
  } = usePlanner("Planner.Day");
  const entries = entriesOn(days, date);
  const inMonth = isInMonth(date);
  const isToday = isSameDay(date, today);
  const isSelected = selected ? isSameDay(date, selected) : false;
  const { shown, overflow } = visibleEntries(entries, entryLimit);
  const drawable = shown.filter((entry) => entry.icon);
  const styles = dayVariants({
    fill,
    inMonth,
    selected: isSelected,
    today: isToday,
    variant,
  });
  const tint = markerColor(entries, colorOf);
  const label = dayAccessibilityLabel(
    calendarLongDate(date, system, locale),
    entries,
    categoryLabels
  );
  const press = () => {
    onDayPress?.(date, entries);
    select(isSelected ? null : date);
  };
  if (renderDay) {
    return (
      <View className="flex-1">
        {renderDay({ date, entries, isInMonth: inMonth, isSelected, isToday })}
      </View>
    );
  }
  if (variant === "tiles" && !inMonth) {
    return (
      <View
        className={cn("mx-[4px] flex-1", fill ? "min-h-0" : "h-[128px]")}
        aria-hidden
      />
    );
  }
  return (
    <Pressable
      pressScale={1}
      pressOpacity={1}
      onPress={press}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={
        entries.length > 0 ? "Opens what is on this day" : undefined
      }
      accessibilityState={{ selected: isSelected }}
      className={styles.cell()}
    >
      {variant === "tiles" && tint ? (
        <View
          aria-hidden
          className={styles.tint()}
          style={{ backgroundColor: tint, opacity: TILE_TINT_OPACITY }}
        />
      ) : null}

      <PlannerDayNumber
        variant={variant}
        date={date}
        isToday={isToday}
        styles={styles}
        system={system}
        locale={locale}
      />

      {variant === "default" && entries.length > 0 ? (
        <View className={styles.marker()} style={{ backgroundColor: tint }} />
      ) : null}

      {variant === "calendar" ? (
        <View className={styles.body()}>
          {shown.map((entry) => (
            <PlannerChip
              key={entry.id}
              entry={entry}
              color={entry.color ?? colorOf(entry.category)}
            />
          ))}

          {overflow > 0 ? (
            <Text
              size="xs"
              muted
              className={styles.overflow()}
              numberOfLines={1}
            >
              •••
            </Text>
          ) : null}
        </View>
      ) : null}

      {variant === "tiles" && overflow > 0 ? (
        <View className={styles.counter()} aria-hidden>
          <Text size="xs" muted className={styles.overflow()}>
            +{overflow}
          </Text>
        </View>
      ) : null}

      {variant !== "calendar" && drawable.length > 0 ? (
        <View className={styles.body()}>
          {drawable.map((entry) => (
            <View key={entry.id}>{entry.icon}</View>
          ))}
          {variant !== "tiles" && overflow > 0 ? (
            <Text size="xs" muted className={styles.overflow()}>
              +{overflow}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
};
export const PlannerGrid = ({ className, renderDay }: PlannerGridProps) => {
  const {
    grid: weeks,
    weekStartsOn,
    locale,
    isInMonth,
    variant,
    fill,
  } = usePlanner("Planner.Grid");
  const { grid, week: weekRow, heading } = plannerVariants({ fill });
  const headings = useMemo(
    () =>
      weekdayNames(
        locale,
        weekStartsOn,
        variant === "tiles" ? "narrow" : "short"
      ),
    [locale, weekStartsOn, variant]
  );
  const shownWeeks = useMemo(
    () =>
      variant === "tiles"
        ? weeks.filter((week) => week.some(isInMonth))
        : weeks,
    [weeks, variant, isInMonth]
  );
  return (
    <>
      <View
        className={grid({ className })}
        style={
          variant === "tiles" && !fill
            ? { height: `${TILE_GRID_HEIGHT * 2}rpx` }
            : undefined
        }
      >
        <View className={weekRow()} aria-hidden>
          {headings.map((label, position) => (
            <Text key={position} size="xs" muted className={heading()}>
              {label.toUpperCase()}
            </Text>
          ))}
        </View>

        {shownWeeks.map((week, index) => (
          <View
            key={index}
            className={cn(weekRow(), variant === "tiles" && "flex-1")}
          >
            {week.map((date) => (
              <PlannerDay
                key={date.getTime()}
                date={date}
                renderDay={renderDay}
              />
            ))}
          </View>
        ))}
      </View>
    </>
  );
};
