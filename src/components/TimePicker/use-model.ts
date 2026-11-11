import { useCallback, useMemo, useRef, useState } from "react";

import { clampTime, formatTime, isSameTime, roundToStep } from "../../lib/time";
import type { TimeValue } from "../../lib/time";
import { DEFAULT_STEP } from "./constants";
import type { FaceProps, TimePickerProps } from "./types";

export const useTimePicker = (props: TimePickerProps) => {
  const {
    value,
    defaultValue,
    onValueChange,
    open: openProp,
    onOpenChange,
    layout = "wheel",
    hourCycle = 12,
    minuteStep,
    minTime,
    maxTime,
    format,
    locale,
    readout = "default",
    disabled = false,
  } = props;
  const supplied = minuteStep ?? DEFAULT_STEP[layout];
  const step =
    Number.isFinite(supplied) && supplied >= 1
      ? supplied
      : DEFAULT_STEP[layout];
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalOpen, setInternalOpen] = useState(false);
  const [syncToken, setSyncToken] = useState(0);
  const controlled = value !== undefined;
  const selected = controlled ? value : internalValue;
  const latest = useRef(selected);
  latest.current = selected;
  const open = openProp ?? internalOpen;
  const fallback = useMemo(
    () =>
      clampTime(
        roundToStep({ hour: new Date().getHours(), minute: 0 }, step),
        minTime,
        maxTime
      ),
    [step, minTime, maxTime]
  );
  const setOpen = useCallback(
    (next: boolean) => {
      if (next && disabled) {
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
    (next: TimeValue) => {
      if (disabled) {
        return;
      }
      const bounded = clampTime(roundToStep(next, step), minTime, maxTime);
      if (isSameTime(bounded, latest.current)) {
        setSyncToken((count) => count + 1);
        return;
      }
      if (controlled) {
        setSyncToken((count) => count + 1);
      } else {
        latest.current = bounded;
        setInternalValue(bounded);
      }
      onValueChange?.(bounded);
    },
    [disabled, step, minTime, maxTime, controlled, onValueChange]
  );
  const face: FaceProps = {
    disabled,
    hourCycle,
    locale,
    maxTime,
    minTime,
    minuteStep: step,
    onValueChange: commit,
    readout,
    syncToken,
    value: selected ?? fallback,
  };
  const label = selected
    ? (format?.(selected) ?? formatTime(selected, { hourCycle, locale }))
    : null;
  return { disabled, face, label, layout, open, setOpen };
};
