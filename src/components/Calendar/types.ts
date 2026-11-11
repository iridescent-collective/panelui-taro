import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

import type { CalendarSystem, DateLocale } from "../../lib/date";

type ViewProps = ComponentProps<typeof View>;
export type CalendarMode = "single" | "multiple" | "range";
export type CalendarCaptionLayout = "label" | "dropdown";
export interface DateRange {
  from: Date;
  to?: Date;
}
export interface CalendarSelection {
  single: Date | undefined;
  multiple: Date[];
  range: DateRange | undefined;
}
export type CalendarDisabled =
  | Date[]
  | {
      from: Date;
      to: Date;
    }
  | ((date: Date) => boolean);
export interface CalendarProps<
  Mode extends CalendarMode = "single",
> extends Omit<ViewProps, "children"> {
  className?: string;
  mode?: Mode;
  selected?: CalendarSelection[Mode];
  defaultSelected?: CalendarSelection[Mode];
  onSelect?: (selected: CalendarSelection[Mode]) => void;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  numberOfMonths?: number;
  captionLayout?: CalendarCaptionLayout;
  disabled?: CalendarDisabled;
  minDate?: Date;
  maxDate?: Date;
  startMonth?: Date;
  endMonth?: Date;
  weekStartsOn?: number | "auto";
  showOutsideDays?: boolean;
  selectOutsideDays?: boolean;
  bordered?: boolean;
  locale?: DateLocale;
  calendar?: CalendarSystem;
}
export interface CalendarHeaderProps {
  offset?: number;
  lastOffset?: number;
}
export interface CalendarNavProps {
  direction: "previous" | "next";
  disabled?: boolean;
  onPress?: () => void;
}
export interface GridProps {
  month: Date;
  mode: CalendarMode;
  value: unknown;
  onSelect: (date: Date) => void;
  disabled?: CalendarDisabled;
  minDate?: Date;
  maxDate?: Date;
  weekStartsOn: number;
  showOutsideDays: boolean;
  selectOutsideDays?: boolean;
  locale: DateLocale;
  system: "gregory" | "islamic";
}
export interface DayProps {
  date: Date;
  outside: boolean;
  selected: boolean;
  inRange: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
  today: boolean;
  disabled: boolean;
  openStart: boolean;
  openEnd: boolean;
  locale: DateLocale;
  system: "gregory" | "islamic";
  onPress: () => void;
}
