import { calendarShortDate } from "../../lib/date";
import type { CalendarSelection, DateRange } from "../Calendar";
import type { DatePickerMode } from "./types";

export const DEFAULT_PLACEHOLDER = "Pick a date";
export const describe = <Mode extends DatePickerMode>(
  mode: Mode,
  value: CalendarSelection[Mode] | undefined,
  locale: string | undefined,
  system: "gregory" | "islamic"
): string | null => {
  if (!value) {
    return null;
  }
  const write = (date: Date) => calendarShortDate(date, system, locale);
  if (mode === "range") {
    const range = value as DateRange;
    if (!range.from) {
      return null;
    }
    return range.to
      ? `${write(range.from)} – ${write(range.to)}`
      : `${write(range.from)} –`;
  }
  if (mode === "multiple") {
    const days = value as Date[];
    const [first] = days;
    if (!first) {
      return null;
    }
    if (days.length === 1) {
      return write(first);
    }
    return `${days.length} dates`;
  }
  return write(value as Date);
};
