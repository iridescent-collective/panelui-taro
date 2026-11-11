import type { Input as NativeInput } from "@tarojs/components";
import { nextTick, showActionSheet } from "@tarojs/taro";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ComponentRef, ForwardedRef } from "react";

import { selectionTick } from "../../lib/haptics";
import { restoreTextValue } from "../../lib/restore-text-value";
import { useInputFocusOwner } from "../../primitives/input-focus";
import type { InputHandle } from "../Input/types";
import type { TagInputProps } from "./types";
import type { TagsState } from "./use-tags";

export const useTagField = (
  props: TagInputProps,
  state: TagsState,
  ref: ForwardedRef<InputHandle>
) => {
  const focusOwner = useInputFocusOwner(props.id);
  const [focused, setFocused] = useState(false);
  const [focusRequested, setFocusRequested] = useState(
    props.focus ?? props.autoFocus ?? false
  );
  const inputRef = useRef<ComponentRef<typeof NativeInput> | null>(null);
  const interactive = !props.disabled && !props.readOnly;
  const latest = useRef({ interactive, props, state });
  latest.current = { interactive, props, state };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (props.focus !== undefined) {
      setFocusRequested(props.focus);
    }
  }, [props.focus]);
  const focus = () => {
    if (latest.current.interactive) {
      setFocusRequested(true);
    }
  };
  const restore = () =>
    nextTick(() => {
      if (mounted.current) {
        restoreTextValue(inputRef.current, latest.current.state.text);
      }
    });
  const tick = async (added: boolean) => {
    if (added && props.haptics) {
      await selectionTick();
    }
  };
  useImperativeHandle(
    ref,
    () => ({
      blur: () => setFocusRequested(false),
      clear: () => {
        latest.current.state.input("");
        restore();
      },
      focus,
      isFocused: () => focused,
    }),
    [focused]
  );
  const onInput: NonNullable<TagInputProps["onInput"]> = async (event) => {
    if (!interactive) {
      restore();
      return;
    }
    const added = state.input(event.detail.value);
    props.onInput?.(event);
    restore();
    await tick(added);
  };
  const onConfirm: NonNullable<TagInputProps["onConfirm"]> = async (event) => {
    if (!interactive) {
      return;
    }
    const added = state.submit();
    props.onSubmitEditing?.(event);
    props.onConfirm?.(event);
    restore();
    await tick(added);
  };
  const onFocus: NonNullable<TagInputProps["onFocus"]> = (event) => {
    if (!interactive) {
      return;
    }
    focusOwner.claim();
    setFocused(true);
    setFocusRequested(true);
    props.onFocus?.(event);
  };
  const onBlur: NonNullable<TagInputProps["onBlur"]> = async (event) => {
    focusOwner.release();
    setFocused(false);
    setFocusRequested(false);
    const added = interactive ? state.blur() : false;
    props.onBlur?.(event);
    restore();
    await tick(added);
  };
  const adjust = async () => {
    const requested = latest.current;
    if (
      !requested.interactive ||
      requested.state.tags.length === 0 ||
      requested.state.text.length > 0
    ) {
      return;
    }
    try {
      const label = requested.state.marked
        ? `Remove ${requested.state.marked.tag}`
        : "Mark last tag for removal";
      const { tapIndex } = await showActionSheet({ itemList: [label] });
      const owner = latest.current;
      if (
        !mounted.current ||
        tapIndex !== 0 ||
        !owner.interactive ||
        owner.state.tags !== requested.state.tags ||
        owner.state.text !== requested.state.text ||
        owner.state.marked !== requested.state.marked
      ) {
        return;
      }
      owner.props.onKeyPress?.({ nativeEvent: { key: "Backspace" } });
      const removed = owner.state.backspace();
      if (removed && owner.props.haptics) {
        await selectionTick();
      }
    } catch {
      return false;
    }
  };
  return {
    adjust,
    clear: () => {
      if (interactive) {
        state.clear();
        restore();
        focus();
      }
    },
    focus,
    focusRequested,
    focused,
    inputRef,
    onBlur,
    onConfirm,
    onFocus,
    onInput,
  };
};
