import { Textarea } from "@tarojs/components";
import { useContext, useState } from "react";

import { mergeStyleAfter } from "../../lib/styles";
import { CONTROL } from "./constants";
import { AIInputInlineContext, useAIInput } from "./context";
import { AI_INPUT_METRICS, growthBounds, heightForLines } from "./growth";
import { useAIInputToken } from "./surface";
import type { AIInputFieldProps } from "./types";
import { aiInputVariants } from "./variants";

export const AIInputField = ({
  className,
  placeholder = "Ask anything",
  onFocus,
  onBlur,
  onInput,
  onLineChange,
  maxLength,
  autoFocus,
  editable,
  keyboardType: _keyboardType,
  onChangeText,
  style,
  ...props
}: AIInputFieldProps) => {
  const { value, setValue, size, disabled, minRows, maxRows, setFocused } =
    useAIInput("AIInput.Field");
  const inline = useContext(AIInputInlineContext);
  const metrics = AI_INPUT_METRICS[size];
  const bounds = growthBounds(metrics, minRows, maxRows);
  const [lines, setLines] = useState(() =>
    Math.max(1, value.split("\n").length)
  );
  const height = inline
    ? Math.min(
        bounds.maxHeight,
        Math.max(CONTROL[size], lines * metrics.lineHeight)
      )
    : Math.max(
        bounds.minHeight,
        Math.min(bounds.maxHeight, heightForLines(metrics, lines))
      );
  const padding = inline
    ? Math.max(0, (height - lines * metrics.lineHeight) / 2)
    : metrics.padding;
  const placeholderColor = useAIInputToken("--color-muted-foreground");
  const slots = aiInputVariants({ size });
  return (
    <Textarea
      {...props}
      value={value}
      maxlength={maxLength ?? props.maxlength ?? -1}
      focus={autoFocus ?? props.focus}
      disabled={disabled || editable === false}
      autoHeight={false}
      adjustPosition={false}
      placeholder={placeholder}
      placeholderStyle={`color:${placeholderColor};`}
      onInput={(event) => {
        if (disabled || editable === false) {
          return;
        }
        setValue(event.detail.value);
        onChangeText?.(event.detail.value);
        onInput?.(event);
      }}
      onLineChange={(event) => {
        setLines(Math.max(1, event.detail.lineCount));
        onLineChange?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      className={
        inline ? slots.fieldInline({ className }) : slots.field({ className })
      }
      style={mergeStyleAfter(style, {
        boxSizing: "border-box",
        fontSize: `${metrics.fontSize * 2}rpx`,
        height: `${height * 2}rpx`,
        lineHeight: `${metrics.lineHeight * 2}rpx`,
        maxHeight: `${bounds.maxHeight * 2}rpx`,
        paddingBottom: `${padding * 2}rpx`,
        paddingTop: `${padding * 2}rpx`,
      })}
    />
  );
};
