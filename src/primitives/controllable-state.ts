import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

const identity = <T>(value: T): T => value;
const objectIs = <T>(left: T, right: T): boolean => Object.is(left, right);
export interface ControllableStateOptions<T> {
  value: T | undefined;
  defaultValue: T;
  onChange?: (value: T) => void;
  onSettled?: (value: T) => void;
  normalize?: (value: T) => T;
  isEqual?: (left: T, right: T) => boolean;
  getValueKey?: (value: T) => unknown;
}
export interface ControllableStateResult<T> {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  isControlled: boolean;
}
export const useControllableState = <T>({
  value: valueProp,
  defaultValue,
  onChange,
  onSettled,
  normalize = identity,
  isEqual = objectIs,
  getValueKey,
}: ControllableStateOptions<T>): ControllableStateResult<T> => {
  const [internalValue, setInternalValue] = useState(() =>
    normalize(defaultValue)
  );
  const isControlled = valueProp !== undefined;
  let controlledKey: unknown;
  if (isControlled) {
    controlledKey = getValueKey ? getValueKey(valueProp as T) : valueProp;
  }
  const controlledValue = useMemo(
    () => (isControlled ? normalize(valueProp as T) : undefined),
    [controlledKey, isControlled, normalize]
  );
  const wasControlled = useRef(isControlled);
  const lastControlledValue = useRef<T | undefined>(controlledValue);
  if (isControlled) {
    lastControlledValue.current = controlledValue;
  }
  const leavingControlled = wasControlled.current && !isControlled;
  let value = internalValue;
  if (leavingControlled) {
    value = lastControlledValue.current as T;
  }
  if (isControlled) {
    value = controlledValue as T;
  }
  const valueRef = useRef(value);
  valueRef.current = value;
  useLayoutEffect(() => {
    if (wasControlled.current && !isControlled) {
      setInternalValue(lastControlledValue.current as T);
    }
    wasControlled.current = isControlled;
  }, [isControlled]);
  const previousSettled = useRef(value);
  useLayoutEffect(() => {
    if (isEqual(previousSettled.current, value)) {
      return;
    }
    previousSettled.current = value;
    onSettled?.(value);
  }, [isEqual, onSettled, value]);
  const setValue = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      const requested = normalize(
        typeof next === "function"
          ? (next as (current: T) => T)(valueRef.current)
          : next
      );
      if (isEqual(valueRef.current, requested)) {
        return;
      }
      if (!isControlled) {
        setInternalValue(requested);
      }
      onChange?.(requested);
    },
    [isControlled, isEqual, normalize, onChange]
  );
  return { isControlled, setValue, value };
};
