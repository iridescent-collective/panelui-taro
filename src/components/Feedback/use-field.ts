import type { Textarea } from "@tarojs/components";
import { nextTick } from "@tarojs/taro";
import { useCallback, useEffect, useRef } from "react";
import type { ComponentProps, ComponentRef, ForwardedRef } from "react";

import { restoreTextValue } from "../../lib/restore-text-value";
import { useFeedback } from "./context";
import type { FeedbackFieldProps } from "./types";

export const useFeedbackField = (
  props: FeedbackFieldProps,
  ref: ForwardedRef<ComponentRef<typeof Textarea>>
) => {
  const dialog = useFeedback("Feedback.Field");
  const value = props.value ?? dialog.value;
  const blocked = Boolean(props.disabled || props.editable === false);
  const owner = useRef({ blocked, value });
  owner.current = { blocked, value };
  const native = useRef<ComponentRef<typeof Textarea> | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const { setFieldValue } = dialog;
  useEffect(() => {
    setFieldValue(props.value);
    return () => setFieldValue(undefined);
  }, [props.value, setFieldValue]);
  const attach = useCallback(
    (node: ComponentRef<typeof Textarea> | null) => {
      native.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );
  const onInput: NonNullable<ComponentProps<typeof Textarea>["onInput"]> = (
    event
  ) => {
    if (!owner.current.blocked) {
      dialog.setValue(event.detail.value);
      props.onChangeText?.(event.detail.value);
      props.onInput?.(event);
    }
    nextTick(() => {
      if (mounted.current) {
        restoreTextValue(native.current, owner.current.value);
      }
    });
  };
  return { attach, blocked, onInput, value };
};
