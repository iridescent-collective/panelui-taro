import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { DateLocale, CalendarSystem } from "../../lib/date";
import type { TextProps } from "../primitives/Text";

export type PlannerViewProps = ComponentProps<typeof View>;
export type PlannerVariant = "default" | "tiles" | "calendar";
export interface PlannerEntry {
  id: string;
  date: Date;
  label: string;
  category?: string;
  icon?: ReactNode;
  color?: string;
}
export interface PlannerCategory {
  id: string;
  label: string;
  colorIndex?: number;
  color?: string;
}
export interface PlannerProps extends Omit<PlannerViewProps, "children"> {
  className?: string;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  entries?: PlannerEntry[];
  categories?: PlannerCategory[];
  selected?: Date | null;
  defaultSelected?: Date | null;
  onSelectedChange?: (date: Date | null) => void;
  onDayPress?: (date: Date, entries: PlannerEntry[]) => void;
  variant?: PlannerVariant;
  fill?: boolean;
  entryLimit?: number;
  weekStartsOn?: number | "auto";
  locale?: DateLocale;
  calendar?: CalendarSystem;
  frame?: boolean;
  children?: ReactNode;
}
export interface PlannerHeaderProps {
  children?: ReactNode;
}
export interface PlannerTitleProps extends Omit<TextProps, "children"> {
  children?: ReactNode;
}
export interface PlannerTodayProps {
  children?: ReactNode;
}
export interface PlannerNavProps {
  className?: string;
}
export interface PlannerActionProps {
  children?: ReactNode;
}
export interface PlannerDayState {
  date: Date;
  entries: PlannerEntry[];
  isToday: boolean;
  isSelected: boolean;
  isInMonth: boolean;
}
export type PlannerDayRenderer = (state: PlannerDayState) => ReactNode;
export interface PlannerGridProps {
  className?: string;
  renderDay?: PlannerDayRenderer;
}
export interface PlannerDayProps {
  date: Date;
  renderDay?: PlannerDayRenderer;
}
export interface PlannerLegendProps {
  className?: string;
  counts?: boolean;
  children?: ReactNode;
}
export interface PlannerSummaryProps extends Omit<TextProps, "children"> {
  children?: ReactNode;
}
export interface PlannerFooterProps {
  className?: string;
  children?: ReactNode;
}
export interface PlannerDetailsProps {
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
  children: (date: Date, entries: PlannerEntry[]) => ReactNode;
}
export interface PlannerScrollerProps {
  className?: string;
  weeks?: number;
  rowHeight?: number;
  renderDay?: PlannerDayRenderer;
}
