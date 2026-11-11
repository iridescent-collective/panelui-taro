import { useImperativeHandle, useRef, useState } from "react";
import type { ForwardedRef } from "react";

import { useInputFocusOwner } from "../../primitives/input-focus";
import type { InputHandle, InputProps, InputNativeProps } from "./types";

export const useInput = (props: InputProps, ref: ForwardedRef<InputHandle>) => {
  const focusOwner = useInputFocusOwner(props.id);
  const [internalValue, setInternalValue] = useState(props.defaultValue ?? "");
  const [focused, setFocused] = useState(false);
  const [focusRequested, setFocusRequested] = useState(
    props.autoFocus ?? false
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const fieldRef = useRef<{
    setAttribute?: (name: string, value: string) => void;
  } | null>(null);
  const blocked = props.disabled || props.editable === false;
  useImperativeHandle(
    ref,
    () => ({
      blur: () => setFocusRequested(false),
      clear: () => {
        fieldRef.current?.setAttribute?.("value", "");
        setInternalValue("");
      },
      focus: () => {
        if (!blocked) {
          setFocusRequested(true);
        }
      },
      isFocused: () => focused,
    }),
    [blocked, focused]
  );
  const onInput: NonNullable<InputNativeProps["onInput"]> = (event) => {
    if (blocked) {
      return props.value ?? internalValue;
    }
    const { value } = event.detail;
    if (props.value === undefined) {
      setInternalValue(value);
    }
    props.onChangeText?.(value);
    const replacement = props.onInput?.(event);
    if (typeof replacement === "string") {
      if (props.value === undefined) {
        setInternalValue(replacement);
      }
      return replacement;
    }
    return props.value;
  };
  const onFocus: NonNullable<InputNativeProps["onFocus"]> = (event) => {
    focusOwner.claim();
    setFocused(true);
    setFocusRequested(true);
    props.onFocus?.(event);
  };
  const onBlur: NonNullable<InputNativeProps["onBlur"]> = (event) => {
    focusOwner.release();
    setFocused(false);
    setFocusRequested(false);
    setKeyboardHeight(0);
    props.onBlur?.(event);
  };
  const onKeyboardHeightChange: NonNullable<
    InputNativeProps["onKeyboardHeightChange"]
  > = (event) => {
    setKeyboardHeight(event.detail.height);
    props.onKeyboardHeightChange?.(event);
  };
  return {
    blocked,
    fieldRef,
    focusRequested,
    focused,
    keyboardHeight,
    onBlur,
    onFocus,
    onInput,
    onKeyboardHeightChange,
    value: props.value ?? internalValue,
  };
};
