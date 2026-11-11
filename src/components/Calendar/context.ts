import { createContext, useContext } from "react";

import type { DateLocale } from "../../lib/date";
import type { CalendarCaptionLayout } from "./types";

interface CalendarContextValue {
  month: Date;
  setMonth: (month: Date) => void;
  locale: DateLocale;
  system: "gregory" | "islamic";
  minDate?: Date;
  maxDate?: Date;
  startMonth?: Date;
  endMonth?: Date;
  captionLayout: CalendarCaptionLayout;
}
export const CalendarContext = createContext<CalendarContextValue | null>(null);
export const useCalendar = (component: string): CalendarContextValue => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Calendar>`);
  }
  return context;
};
