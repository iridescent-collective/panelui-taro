import type { ReactNode } from "react";

import type { CalendarSystem } from "../../lib/date";
import type { HourCycle, TimeValue } from "../../lib/time";
import type { CalendarDisabled, CalendarCaptionLayout } from "../Calendar";
import type { TimePickerLayout } from "../TimePicker";

export type DateTimePickerPresentation =
  | "popover"
  | "bottom-sheet"
  | "dialog"
  | "inline";
export interface DateTimePickerProps {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (value: Date) => void;
  layout?: TimePickerLayout;
  presentation?: DateTimePickerPresentation;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hourCycle?: HourCycle;
  minuteStep?: number;
  minTime?: TimeValue;
  maxTime?: TimeValue;
  placeholder?: string;
  format?: (value: Date) => string;
  disabled?: boolean;
  disabledDates?: CalendarDisabled;
  minDate?: Date;
  maxDate?: Date;
  captionLayout?: CalendarCaptionLayout;
  weekStartsOn?: number;
  locale?: string;
  calendar?: CalendarSystem;
  doneLabel?: string;
  timeLabel?: string;
  className?: string;
  children?: ReactNode;
}
