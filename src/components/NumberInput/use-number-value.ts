import { useCallback, useEffect, useRef, useState } from "react";

import { selectionTick } from "../../lib/haptics";
import { normalize } from "./number-input-math";
import type { NumberInputProps } from "./types";

const NUMBER_PREFIX =
  /^\s*[+-]?(?:Infinity|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/u;
const parseNumberDraft = (text: string): number => {
  const prefix = text.match(NUMBER_PREFIX)?.[0];
  return prefix === undefined ? Number.NaN : Number(prefix);
};

export const useNumberValue = ({
  value: controlledValue,
  defaultValue,
  min = -Infinity,
  max = Infinity,
  step = 1,
  onValueChange,
  formatValue,
  haptics,
}: NumberInputProps) => {
  const controlled = controlledValue !== undefined;
  const [uncontrolled, setUncontrolled] = useState(() =>
    normalize(
      controlledValue ?? defaultValue ?? (Number.isFinite(min) ? min : 0),
      min,
      max,
      step
    )
  );
  const value = controlled
    ? normalize(controlledValue, min, max, step)
    : uncontrolled;
  const valueRef = useRef(value);
  valueRef.current = value;
  const format = useCallback(
    (current: number) => (formatValue ? formatValue(current) : String(current)),
    [formatValue]
  );
  const [text, setText] = useState(() => format(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) {
      setText(format(value));
    }
  }, [value, focused, format]);
  const commit = useCallback(
    async (next: number, tick: boolean) => {
      const clamped = normalize(next, min, max, step);
      const previous = valueRef.current;
      if (!controlled) {
        valueRef.current = clamped;
        setUncontrolled(clamped);
      }
      if (clamped !== previous) {
        onValueChange?.(clamped);
      }
      if (tick && haptics) {
        await selectionTick();
      }
    },
    [min, max, step, controlled, onValueChange, haptics]
  );
  const endEditing = async () => {
    const parsed = parseNumberDraft(text);
    const next = Number.isNaN(parsed)
      ? valueRef.current
      : normalize(parsed, min, max, step);
    await commit(next, false);
    setFocused(false);
    setText(format(valueRef.current));
  };
  return { commit, endEditing, setFocused, setText, text, value, valueRef };
};
