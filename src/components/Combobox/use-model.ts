import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useBackHandler } from "../../hooks/use-back-handler";
import { useElementLayout } from "../../hooks/use-element-layout";
import { useKeyboard } from "../../hooks/use-keyboard";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { collectComboboxOptions, filterComboboxOptions } from "./options";
import type {
  ComboboxAnchor,
  ComboboxMode,
  ComboboxProps,
  ComboboxSelection,
} from "./types";

export const useComboboxModel = <Mode extends ComboboxMode>(
  props: ComboboxProps<Mode>
) => {
  const {
    mode,
    value,
    defaultValue,
    onValueChange,
    inputValue,
    defaultInputValue = "",
    onInputValueChange,
    disabled = false,
    presentation = "overlay",
    filter = true,
    allowCustomValue = false,
    onOpenChange,
    children,
  } = props;
  const multiple = mode === "multiple";
  const isValueControlled = Object.hasOwn(props, "value");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [focusInput, setFocusInput] = useState(false);
  const [anchor, setAnchor] = useState<ComboboxAnchor | null>(null);
  const [flipped, setFlipped] = useState<boolean | null>(null);
  const [internalValue, setInternalValue] = useState<ComboboxSelection[Mode]>(
    () =>
      (defaultValue ?? (multiple ? [] : undefined)) as ComboboxSelection[Mode]
  );
  const selection: string | string[] | undefined = isValueControlled
    ? value
    : internalValue;
  const [internalQuery, setInternalQuery] = useState(defaultInputValue);
  const query = inputValue ?? internalQuery;
  const values = useMemo<string[]>(() => {
    if (selection === undefined) {
      return [];
    }
    return Array.isArray(selection) ? selection : [selection];
  }, [selection]);
  const options = useMemo(() => collectComboboxOptions(children), [children]);
  const labelOf = useCallback(
    (candidate: string) =>
      options.find((option) => option.value === candidate)?.label ?? candidate,
    [options]
  );
  const setQuery = (next: string) => {
    if (inputValue === undefined) {
      setInternalQuery(next);
    }
    onInputValueChange?.(next);
  };
  const commit = (next: ComboboxSelection[Mode]) => {
    if (!isValueControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };
  const latest = useRef({ disabled, onOpenChange, open });
  latest.current = { disabled, onOpenChange, open };
  const mounted = useRef(true);
  const request = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current += 1;
    };
  }, []);
  const setOpenState = (next: boolean) => {
    if (latest.current.open === next) {
      return;
    }
    latest.current.open = next;
    setOpen(next);
    latest.current.onOpenChange?.(next);
  };
  const measured = useElementLayout(false, children, undefined, false);
  const refresh = (opening: boolean) => {
    request.current += 1;
    const version = request.current;
    measured.refresh(
      () =>
        mounted.current &&
        version === request.current &&
        !latest.current.disabled,
      (rect) => {
        if (!rect) {
          return;
        }
        setAnchor({
          height: rect.height,
          width: rect.width,
          x: rect.left,
          y: rect.top,
        });
        if (opening) {
          setOpenState(true);
        }
      }
    );
  };
  const openList = () => {
    if (disabled) {
      return;
    }
    if (presentation === "inline") {
      setOpenState(true);
    } else {
      refresh(true);
    }
  };
  const close = () => {
    request.current += 1;
    setOpenState(false);
  };
  useBackHandler(open && presentation === "overlay", close);
  useEffect(() => {
    if (!open) {
      setFlipped(null);
    }
  }, [open]);
  const { height: screenHeight } = useWindowMetrics();
  const keyboard = useKeyboard();
  const keyboardHeight = keyboard.height;
  const dragging = useRef(false);
  const stale = useRef(false);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelSettle = () => {
    if (settle.current !== null) {
      clearTimeout(settle.current);
    }
    settle.current = null;
  };
  const onListSettled = () => {
    cancelSettle();
    dragging.current = false;
    if (stale.current) {
      stale.current = false;
      refresh(false);
    }
  };
  useEffect(() => {
    if (!open || presentation !== "overlay") {
      return;
    }
    if (dragging.current) {
      stale.current = true;
    } else {
      refresh(false);
    }
  }, [open, presentation, keyboardHeight, screenHeight]);
  useEffect(() => () => cancelSettle(), []);
  const singleValue = multiple ? undefined : (selection as string | undefined);
  useEffect(() => {
    if (multiple || focused || open || allowCustomValue) {
      return;
    }
    setQuery(singleValue === undefined ? "" : labelOf(singleValue));
  }, [multiple, focused, open, allowCustomValue, singleValue, labelOf]);
  const matcher = (option: (typeof options)[number]) => {
    if (filter === false) {
      return true;
    }
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return true;
    }
    return typeof filter === "function"
      ? filter(option, query.trim())
      : option.label.toLowerCase().includes(needle);
  };
  const filtered =
    filter === false || !query.trim()
      ? null
      : filterComboboxOptions(children, matcher);
  const exactMatch = options.some(
    (option) => option.label.toLowerCase() === query.trim().toLowerCase()
  );
  const select = (next: string) => {
    if (disabled) {
      return;
    }
    if (multiple) {
      const current = Array.isArray(selection) ? selection : [];
      const without = current.filter((entry) => entry !== next);
      commit(
        (without.length === current.length
          ? [...current, next]
          : without) as ComboboxSelection[Mode]
      );
      setQuery("");
      return;
    }
    commit(next as ComboboxSelection[Mode]);
    setQuery(labelOf(next));
    close();
    setFocusInput(false);
  };
  const submit = () => {
    if (disabled) {
      return;
    }
    const typed = query.trim();
    if (!typed) {
      return;
    }
    const match = options.find(
      (option) => option.label.toLowerCase() === typed.toLowerCase()
    );
    if (match && !match.disabled) {
      select(match.value);
      return;
    }
    if (!allowCustomValue) {
      return;
    }
    if (multiple) {
      const current = Array.isArray(selection) ? selection : [];
      if (!current.includes(typed)) {
        commit([...current, typed] as ComboboxSelection[Mode]);
      }
      setQuery("");
      return;
    }
    commit(typed as ComboboxSelection[Mode]);
    close();
  };
  const remove = (target: string) => {
    if (disabled) {
      return;
    }
    const current = Array.isArray(selection) ? selection : [];
    commit(
      current.filter((entry) => entry !== target) as ComboboxSelection[Mode]
    );
  };
  const clear = () => {
    if (disabled) {
      return;
    }
    setQuery("");
    commit((multiple ? [] : undefined) as ComboboxSelection[Mode]);
    setFocusInput(true);
  };
  return {
    anchor,
    clear,
    close,
    exactMatch,
    filtered,
    flipped,
    focusInput,
    focused,
    keyboardHeight,
    labelOf,
    measured,
    multiple,
    onListEnd: () => {
      cancelSettle();
      settle.current = setTimeout(onListSettled, 80);
    },
    onListSettled,
    onListStart: () => {
      cancelSettle();
      dragging.current = true;
    },
    open,
    openList,
    options,
    query,
    remove,
    screenHeight,
    select,
    setFlipped,
    setFocusInput,
    setFocused,
    setQuery,
    submit,
    values,
  };
};
