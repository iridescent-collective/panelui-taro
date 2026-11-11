import type { ReactNode } from "react";

import type { HourCycle, TimeValue } from "../../lib/time";

export type { HourCycle, TimeValue } from "../../lib/time";
export type TimePickerLayout = "wheel" | "clock" | "ruler";
export type TimePickerPresentation =
  | "popover"
  | "dialog"
  | "bottom-sheet"
  | "inline";
export type TimePickerReadout = "default" | "compact" | "none";
export interface TimePickerProps {
  value?: TimeValue;
  defaultValue?: TimeValue;
  onValueChange?: (value: TimeValue) => void;
  layout?: TimePickerLayout;
  presentation?: TimePickerPresentation;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hourCycle?: HourCycle;
  minuteStep?: number;
  minTime?: TimeValue;
  maxTime?: TimeValue;
  placeholder?: string;
  format?: (value: TimeValue) => string;
  locale?: string;
  readout?: TimePickerReadout;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}
export interface FaceProps {
  value: TimeValue;
  onValueChange: (value: TimeValue) => void;
  syncToken: number;
  hourCycle: HourCycle;
  minuteStep: number;
  minTime?: TimeValue;
  maxTime?: TimeValue;
  locale?: string;
  disabled?: boolean;
  readout?: TimePickerReadout;
}
