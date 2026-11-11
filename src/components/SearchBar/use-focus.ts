import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { useKeyboard } from "../../hooks/use-keyboard";
import { useInputFocusScope } from "../../primitives/input-focus";
import type { InputHandle } from "../Input";
import { BLUR_GRACE, FOCUS_GUARD } from "./constants";
import type { SearchBarProps } from "./types";

export const useSearchFocus = (
  props: SearchBarProps,
  inputRef: RefObject<InputHandle>,
  fieldId: string
) => {
  const [focused, setFocused] = useState(false);
  const { height } = useKeyboard();
  const scope = useInputFocusScope();
  const latest = useRef({ height, props });
  latest.current = { height, props };
  const guarded = useRef(false);
  const ending = useRef(false);
  const guardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearClose = useCallback(() => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);
  const clearGuard = useCallback(() => {
    guarded.current = false;
    if (guardTimer.current !== null) {
      clearTimeout(guardTimer.current);
      guardTimer.current = null;
    }
  }, []);
  const retainFocus = useCallback(() => {
    if (latest.current.props.disabled) {
      return;
    }
    clearGuard();
    guarded.current = true;
    guardTimer.current = setTimeout(() => {
      guarded.current = false;
      guardTimer.current = null;
    }, FOCUS_GUARD);
    inputRef.current?.focus();
  }, [inputRef, clearGuard]);
  const focus = useCallback<NonNullable<SearchBarProps["onFocus"]>>(
    (event) => {
      clearClose();
      ending.current = false;
      setFocused(true);
      latest.current.props.onFocus?.(event);
    },
    [clearClose]
  );
  const blur = useCallback<NonNullable<SearchBarProps["onBlur"]>>(
    (event) => {
      latest.current.props.onBlur?.(event);
      const activeHolder = scope.read();
      const focusedElsewhere =
        activeHolder !== null && activeHolder !== fieldId;
      if (guarded.current && !ending.current && !focusedElsewhere) {
        inputRef.current?.focus();
        return;
      }
      clearClose();
      closeTimer.current = setTimeout(() => {
        closeTimer.current = null;
        const holder = scope.read();
        const elsewhere = holder !== null && holder !== fieldId;
        if (!ending.current && latest.current.height > 0 && !elsewhere) {
          inputRef.current?.focus();
          return;
        }
        setFocused(false);
      }, BLUR_GRACE);
    },
    [clearClose, inputRef, scope, fieldId]
  );
  const end = useCallback(() => {
    ending.current = true;
    clearGuard();
    clearClose();
    setFocused(false);
    inputRef.current?.blur();
  }, [clearGuard, clearClose, inputRef]);
  useEffect(
    () => () => {
      clearGuard();
      clearClose();
    },
    [clearGuard, clearClose]
  );
  return { blur, end, focus, focused, keyboardHeight: height, retainFocus };
};
