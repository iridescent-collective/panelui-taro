import type { ReactElement, ReactNode } from "react";

import type { CalendarSystem } from "../../lib/date";
import type {
  CalendarMode,
  CalendarSelection,
  CalendarDisabled,
  CalendarCaptionLayout,
} from "../Calendar";
import type { PopoverPresentation } from "../Popover";

export type DatePickerMode = CalendarMode;
export interface DatePickerProps<Mode extends DatePickerMode = "single"> {
  mode?: Mode;
  selected?: CalendarSelection[Mode];
  defaultSelected?: CalendarSelection[Mode];
  onSelect?: (selected: CalendarSelection[Mode]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  format?: (selected: CalendarSelection[Mode]) => string;
  presentation?: PopoverPresentation;
  disabled?: boolean;
  disabledDates?: CalendarDisabled;
  minDate?: Date;
  maxDate?: Date;
  startMonth?: Date;
  endMonth?: Date;
  numberOfMonths?: number;
  captionLayout?: CalendarCaptionLayout;
  weekStartsOn?: number;
  selectOutsideDays?: boolean;
  locale?: string;
  calendar?: CalendarSystem;
  className?: string;
  children?:
    | ReactElement<{
        onPress?: () => void;
      }>
    | ReactNode;
}
