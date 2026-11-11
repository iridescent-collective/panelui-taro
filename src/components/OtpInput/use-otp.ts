import type { Input as NativeInput } from "@tarojs/components";
import { nextTick } from "@tarojs/taro";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ComponentProps, ComponentRef, ForwardedRef } from "react";

import { restoreTextValue } from "../../lib/restore-text-value";
import { useInputFocusOwner } from "../../primitives/input-focus";
import type { InputHandle } from "../Input/types";
import { resolveOtpEditable, sanitizeOtp } from "./state";
import type { OtpInputProps } from "./types";

export const useOtp = (
  props: OtpInputProps,
  length: number,
  type: "numeric" | "text",
  ref: ForwardedRef<InputHandle>
) => {
  const focusOwner = useInputFocusOwner(props.id);
  const [internal, setInternal] = useState(() =>
    sanitizeOtp(props.defaultValue ?? "", length, type)
  );
  const value = sanitizeOtp(props.value ?? internal, length, type);
  const controlled = props.value !== undefined && props.value !== null;
  const blocked = !resolveOtpEditable(props.editable, props.disabled);
  const [focused, setFocused] = useState(false);
  const [focusRequested, setFocusRequested] = useState(props.focus ?? false);
  useEffect(() => {
    if (props.focus !== undefined) {
      setFocusRequested(props.focus);
    }
  }, [props.focus]);
  const native = useRef<ComponentRef<typeof NativeInput> | null>(null);
  const completed = useRef(false);
  const owner = useRef({ blocked, value });
  owner.current = { blocked, value };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    completed.current = value.length === length;
  }, [value.length, length]);
  useImperativeHandle(
    ref,
    () => ({
      blur: () => setFocusRequested(false),
      clear: () => {
        setInternal("");
        restoreTextValue(native.current, controlled ? value : "");
      },
      focus: () => {
        if (!owner.current.blocked) {
          setFocusRequested(true);
        }
      },
      isFocused: () => focused,
    }),
    [controlled, value, focused]
  );
  const onInput: NonNullable<ComponentProps<typeof NativeInput>["onInput"]> = (
    event
  ) => {
    if (!blocked) {
      const next = sanitizeOtp(event.detail.value, length, type);
      if (!controlled) {
        setInternal(next);
      }
      props.onChangeText?.(next);
      props.onInput?.(event);
      if (next.length === length) {
        if (!completed.current) {
          completed.current = true;
          props.onComplete?.(next);
        }
      } else {
        completed.current = false;
      }
    }
    nextTick(() => {
      if (mounted.current) {
        restoreTextValue(native.current, owner.current.value);
      }
    });
  };
  const onFocus: NonNullable<ComponentProps<typeof NativeInput>["onFocus"]> = (
    event
  ) => {
    focusOwner.claim();
    setFocused(true);
    setFocusRequested(true);
    props.onFocus?.(event);
  };
  const onBlur: NonNullable<ComponentProps<typeof NativeInput>["onBlur"]> = (
    event
  ) => {
    focusOwner.release();
    setFocused(false);
    setFocusRequested(false);
    props.onBlur?.(event);
  };
  return {
    blocked,
    focus: () => {
      if (!blocked) {
        setFocusRequested(true);
      }
    },
    focusRequested,
    focused,
    native,
    onBlur,
    onFocus,
    onInput,
    value,
  };
};
