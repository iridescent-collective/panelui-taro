import { useCallback, useEffect, useRef, useState } from "react";

import {
  cancelSearchBarDebounce,
  flushSearchBarDebounce,
  scheduleSearchBarDebounce,
} from "./debounce";
import type { SearchBarDebounceTimer } from "./debounce";
import type { SearchBarProps } from "./types";

export const useSearchText = (props: SearchBarProps) => {
  const [internal, setInternal] = useState(props.defaultValue ?? "");
  const text = props.value ?? internal;
  const latest = useRef(props);
  latest.current = props;
  const currentText = useRef(text);
  currentText.current = text;
  const timer = useRef<SearchBarDebounceTimer["current"]>(null);
  const delay = props.debounce ?? 0;
  const previous = useRef({ delay, text });
  const setText = useCallback((next: string) => {
    if (latest.current.value === undefined) {
      currentText.current = next;
      setInternal(next);
    }
    latest.current.onChangeText?.(next);
  }, []);
  useEffect(() => {
    if (previous.current.text === text && previous.current.delay === delay) {
      return;
    }
    previous.current = { delay, text };
    scheduleSearchBarDebounce(
      timer,
      (value) => latest.current.onDebouncedChange?.(value),
      text,
      delay
    );
    return () => cancelSearchBarDebounce(timer);
  }, [text, delay]);
  const submit = useCallback<NonNullable<SearchBarProps["onConfirm"]>>(
    (event) => {
      if (latest.current.disabled) {
        return;
      }
      flushSearchBarDebounce(
        timer,
        latest.current.onDebouncedChange,
        currentText.current
      );
      latest.current.onSubmit?.(currentText.current);
      latest.current.onSubmitEditing?.(event);
      latest.current.onConfirm?.(event);
    },
    []
  );
  useEffect(() => () => cancelSearchBarDebounce(timer), []);
  return { setText, submit, text };
};
