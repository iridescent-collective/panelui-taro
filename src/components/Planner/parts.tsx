import { View } from "@tarojs/components";
import { Children, isValidElement } from "react";
import type { ReactNode } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import {
  addCalendarMonths,
  calendarLongDate,
  calendarMonthLabel,
  isSameCalendarMonth,
} from "../../lib/date";
import { cn } from "../../lib/utils";
import { AnimatedPressable as Pressable } from "../../primitives/animated-pressable";
import { Dialog } from "../Dialog";
import { Frame } from "../Frame";
import { Text } from "../primitives/Text";
import { usePlanner } from "./context";
import { entriesOn } from "./planner-entries";
import type {
  PlannerHeaderProps,
  PlannerTitleProps,
  PlannerTodayProps,
  PlannerNavProps,
  PlannerActionProps,
  PlannerLegendProps,
  PlannerSummaryProps,
  PlannerFooterProps,
  PlannerDetailsProps,
} from "./types";
import { plannerVariants } from "./variants";

export const PlannerArrow = ({
  direction,
  onPress,
}: {
  direction: "previous" | "next";
  onPress: () => void;
}) => (
  <Pressable
    pressScale={1}
    pressOpacity={1}
    onPress={onPress}
    hitSlop={8}
    accessibilityRole="button"
    accessibilityLabel={direction === "next" ? "Next month" : "Previous month"}
    className="flex h-[64px] w-[64px] flex-col items-center justify-center rounded-[var(--panel-radius-lg)] active:bg-[var(--panel-accent)]"
  >
    {direction === "next" ? (
      <ChevronRightIcon size={18} />
    ) : (
      <ChevronLeftIcon size={18} />
    )}
  </Pressable>
);
export const PlannerAction = ({ children }: PlannerActionProps) => (
  <Frame.Action>{children}</Frame.Action>
);
export const PlannerLegend = ({
  className,
  counts = false,
  children,
}: PlannerLegendProps) => {
  const { summary, colorOf } = usePlanner("Planner.Legend");
  const { legend, swatch } = plannerVariants();
  return (
    <View
      className={cn(
        legend(),
        "justify-between border-t-[2px] border-solid border-[var(--panel-border)]",
        className
      )}
    >
      <View className="flex flex-row flex-wrap items-center gap-x-[32px] gap-y-[16px]">
        {summary.categories.map((category) => (
          <View
            key={category.id}
            className="flex flex-row items-center gap-[12px]"
          >
            <View
              className={swatch()}
              style={{ backgroundColor: colorOf(category.id) }}
            />
            <Text size="xs" muted>
              {counts ? `${category.label} ${category.count}` : category.label}
            </Text>
          </View>
        ))}
      </View>
      {children}
    </View>
  );
};
export const PlannerNav = ({ className }: PlannerNavProps) => {
  const { month, setMonth, system, locale } = usePlanner("Planner.Nav");
  return (
    <View className={cn("flex flex-row items-center gap-[8px]", className)}>
      <PlannerArrow
        direction="previous"
        onPress={() => setMonth(addCalendarMonths(month, -1, system, locale))}
      />
      <PlannerArrow
        direction="next"
        onPress={() => setMonth(addCalendarMonths(month, 1, system, locale))}
      />
    </View>
  );
};
export const PlannerHeader = ({ children }: PlannerHeaderProps) => {
  const parts = Children.toArray(children);
  const trails = (child: ReactNode) =>
    isValidElement(child) &&
    (child.type === PlannerNav || child.type === PlannerAction);
  const trailing = parts.filter(trails);
  const lead = parts.filter((child) => !trails(child));
  return (
    <Frame.Header>
      <View className="flex min-w-[0px] shrink flex-row items-center gap-[16px]">
        {lead}
      </View>

      {trailing.length > 0 ? (
        <View className="ml-auto flex shrink-0 flex-row items-center gap-[12px]">
          {trailing}
        </View>
      ) : null}
    </Frame.Header>
  );
};
export const PlannerTitle = ({
  children,
  className,
  ...props
}: PlannerTitleProps) => {
  const { month, system, locale } = usePlanner("Planner.Title");
  return (
    <Text
      weight="medium"
      className={cn("text-[32px] leading-[1.5]", className)}
      {...props}
    >
      {children ?? calendarMonthLabel(month, system, locale)}
    </Text>
  );
};
export const PlannerToday = ({ children = "Today" }: PlannerTodayProps) => {
  const { today, setMonth, month, system, locale } =
    usePlanner("Planner.Today");
  const alreadyHere = isSameCalendarMonth(today, month, system, locale);
  return (
    <Pressable
      pressScale={1}
      pressOpacity={1}
      onPress={() => setMonth(today)}
      disabled={alreadyHere}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel="Go to this month"
      accessibilityState={{ disabled: alreadyHere }}
      className={cn(
        "rounded-full border-[2px] border-solid border-[var(--panel-border)] px-[24px] py-[8px]",
        alreadyHere ? "opacity-40" : "active:bg-accent"
      )}
    >
      <Text size="xs" muted>
        {children}
      </Text>
    </Pressable>
  );
};
export const PlannerSummary = ({ children, ...props }: PlannerSummaryProps) => {
  const { summary } = usePlanner("Planner.Summary");
  return (
    <Text size="xs" muted {...props}>
      {children ??
        `${summary.total} ${summary.total === 1 ? "entry" : "entries"}`}
    </Text>
  );
};
export const PlannerFooter = ({ className, children }: PlannerFooterProps) => (
  <View
    className={cn(
      "flex flex-row items-center justify-between gap-[24px] px-[32px] py-[24px]",
      className
    )}
  >
    {children}
  </View>
);
export const PlannerDetails = ({
  className,
  title,
  description,
  children,
}: PlannerDetailsProps) => {
  const { selected, select, days, system, locale } =
    usePlanner("Planner.Details");
  const entries = selected ? entriesOn(days, selected) : [];
  const count = entries.length === 1 ? "1 entry" : `${entries.length} entries`;
  return (
    <Dialog
      open={selected !== null}
      onOpenChange={(open) => !open && select(null)}
    >
      <Dialog.Content className={cn("gap-[24px]", className)}>
        <View className="flex flex-col gap-[4px]">
          <Dialog.Title>
            {title ??
              (selected ? calendarLongDate(selected, system, locale) : "")}
          </Dialog.Title>
          {description === null ? null : (
            <Dialog.Description>
              {description ??
                (entries.length === 0 ? "Nothing planned" : count)}
            </Dialog.Description>
          )}
        </View>
        {selected ? children(selected, entries) : null}
      </Dialog.Content>
    </Dialog>
  );
};
