import type { Textarea } from "@tarojs/components";
import { getWindowInfo } from "@tarojs/taro";
import { useState } from "react";
import type { ComponentProps } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { mergeStyle } from "../../lib/styles";
import {
  fieldKeyboard,
  useFieldColors,
} from "../../primitives/field/presentation";
import type { useInput } from "../Input/use-input";
import { METRICS } from "./constants";
import type { TextareaProps } from "./types";
import { textareaVariants } from "./variants";

export const useTextareaPresentation = (
  props: TextareaProps,
  state: ReturnType<typeof useInput>
) => {
  const field = useElementLayout(
    !!props.onContentSizeChange,
    state.value,
    props.id
  );
  const [contentHeight, setContentHeight] = useState(0);
  const metrics = METRICS[props.size ?? "md"];
  const rows = props.rows ?? 4;
  const minHeight = rows * metrics.lineHeight + metrics.padding * 2;
  const maxHeight =
    Math.max(rows, props.maxRows ?? 10) * metrics.lineHeight +
    metrics.padding * 2;
  const height = props.autoGrow
    ? Math.min(
        Math.max(minHeight, contentHeight + metrics.padding * 2),
        maxHeight
      )
    : minHeight;
  const limit = props.maxLength ?? props.maxlength;
  const { length } = state.value;
  const slots = textareaVariants({
    disabled: !!state.blocked,
    over: !!limit && length >= limit,
    size: props.size,
    variant: props.variant,
  });
  const reducedMotion = usePanelReducedMotion();
  const invalid = !!props.errorMessage;
  const colors = useFieldColors(invalid, state.focused);
  const fieldStyle = mergeStyle(
    {
      borderColor: colors.border,
      height: `${height * 2}rpx`,
      lineHeight: `${metrics.lineHeight * 2}rpx`,
      paddingBottom: `${metrics.padding * 2}rpx`,
      paddingTop: `${metrics.padding * 2}rpx`,
      transition: reducedMotion ? "none" : "border-color 150ms ease",
    },
    props.style
  );
  const onLineChange: NonNullable<
    ComponentProps<typeof Textarea>["onLineChange"]
  > = (event) => {
    const measuredHeight =
      (event.detail.height * 375) / getWindowInfo().windowWidth;
    if (props.autoGrow) {
      // WeChat can include the field padding in detail.height. Count actual
      // text rows so growing the box never counts that padding a second time.
      setContentHeight(
        Math.max(1, event.detail.lineCount) * metrics.lineHeight
      );
    }
    props.onLineChange?.(event);
    props.onContentSizeChange?.({
      nativeEvent: {
        contentSize: {
          height: measuredHeight,
          width: field.layout?.width ?? 0,
        },
      },
    });
  };
  return {
    colors,
    field,
    fieldStyle,
    invalid,
    keyboard: fieldKeyboard(props, state),
    length,
    limit,
    onLineChange,
    slots,
  };
};
