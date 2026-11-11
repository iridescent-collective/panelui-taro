import { useCallback, useMemo, useRef, useState } from "react";

import { calendarShortDate, resolveCalendar } from "../../lib/date";
import {
  clampTime,
  formatTime,
  roundToStep,
  timeFromDate,
  timeToDate,
} from "../../lib/time";
import type { TimeValue } from "../../lib/time";
import type { DateTimePickerProps } from "./types";

export const useDateTimePicker = (props: DateTimePickerProps) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    open: openProp,
    onOpenChange,
    layout = "ruler",
    hourCycle = 12,
    minuteStep,
    minTime,
    maxTime,
    format,
    disabled = false,
    locale,
    calendar = "gregory",
  } = props;
  const system = useMemo(
    () => resolveCalendar(calendar, locale),
    [calendar, locale]
  );
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalOpen, setInternalOpen] = useState(false);
  const [draftTime, setDraftTime] = useState<TimeValue | undefined>(
    defaultValue ? timeFromDate(defaultValue) : undefined
  );
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : internalValue;
  const open = openProp ?? internalOpen;
  const time = value ? timeFromDate(value) : draftTime;
  const latest = useRef({ time, value });
  latest.current = { time, value };
  const fallback = useMemo(
    () =>
      clampTime(
        roundToStep(
          { hour: new Date().getHours(), minute: 0 },
          minuteStep ?? 15
        ),
        minTime,
        maxTime
      ),
    [minuteStep, minTime, maxTime]
  );
  const setOpen = useCallback(
    (next: boolean) => {
      if (disabled && next) {
        return;
      }
      if (openProp === undefined) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [disabled, openProp, onOpenChange]
  );
  const commit = useCallback(
    (next: Date) => {
      if (disabled) {
        return;
      }
      if (!controlled) {
        latest.current = { time: timeFromDate(next), value: next };
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [disabled, controlled, onValueChange]
  );
  const handleDay = useCallback(
    (day: Date | undefined) => {
      if (day) {
        commit(timeToDate(latest.current.time ?? fallback, day));
      }
    },
    [commit, fallback]
  );
  const handleTime = useCallback(
    (next: TimeValue) => {
      if (disabled) {
        return;
      }
      setDraftTime(next);
      commit(timeToDate(next, latest.current.value ?? new Date()));
    },
    [disabled, commit]
  );
  const label = value
    ? (format?.(value) ??
      `${calendarShortDate(value, system, locale)} · ${formatTime(timeFromDate(value), { hourCycle, locale })}`)
    : null;
  return {
    disabled,
    fallback,
    handleDay,
    handleTime,
    hourCycle,
    label,
    layout,
    open,
    setOpen,
    time,
    value,
  };
};
