import { Input as NativeInput, View } from "@tarojs/components";
import { useMemo } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { XIcon } from "../../icons";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { nativeTagProps } from "./native-props";
import { TagList } from "./tag-list";
import type { TagInputProps } from "./types";
import type { useTagField } from "./use-field";
import type { TagsState } from "./use-tags";
import { tagInputVariants } from "./variants";

interface FieldProps {
  props: TagInputProps;
  state: TagsState;
  field: ReturnType<typeof useTagField>;
  invalid: boolean;
}
export const TagField = ({ props, state, field, invalid }: FieldProps) => {
  const reduced = usePanelReducedMotion();
  const measureInput = useMemo(
    () => ({ className: props.className, size: props.size }),
    [props.className, props.size]
  );
  const measured = useElementLayout(true, measureInput, undefined, false);
  const resting = useThemeToken("input");
  const ring = useThemeToken("ring");
  const error = useThemeToken("destructive");
  const muted = useThemeToken("muted-foreground");
  const idle = invalid ? error : resting;
  const active = invalid ? error : ring;
  const interactive = !props.disabled && !props.readOnly;
  const hasContent = state.tags.length > 0 || state.text.length > 0;
  const size = props.size ?? "md";
  const native = nativeTagProps(props);
  const slots = tagInputVariants({
    disabled: !!props.disabled,
    size,
    variant: props.variant,
  });
  return (
    <View
      id={measured.id}
      onClick={field.focus}
      onLongPress={field.adjust}
      className={slots.field({ className: props.className })}
      style={{
        borderColor: field.focused ? active : idle,
        position: "relative",
        transition: reduced ? "none" : "border-color 150ms ease-in-out",
      }}
    >
      <TagList
        state={state}
        props={props}
        interactive={interactive}
        size={size}
        container={measured.layout}
      />
      {props.readOnly ? null : (
        <NativeInput
          {...native}
          ref={field.inputRef}
          value={state.text}
          focus={field.focusRequested && !props.disabled}
          onInput={field.onInput}
          onFocus={field.onFocus}
          onBlur={field.onBlur}
          onConfirm={field.onConfirm}
          disabled={props.disabled}
          confirmHold
          confirmType={native.confirmType}
          maxlength={props.maxLength ?? props.maxlength ?? -1}
          placeholder={state.tags.length > 0 ? undefined : props.placeholder}
          placeholderStyle={
            native.placeholderStyle ??
            `color:${props.placeholderTextColor ?? muted}`
          }
          aria-label={
            props.accessibilityLabel ?? props.label ?? props.placeholder
          }
          aria-required={props.isRequired}
          aria-invalid={invalid}
          aria-disabled={props.disabled}
          className={slots.input()}
        />
      )}
      {props.clearable && hasContent && interactive ? (
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Clear all tags"
          hitSlop={8}
          onPress={field.clear}
          className={`flex ${slots.clear()}`}
        >
          <XIcon size={16} color={muted} />
        </AnimatedPressable>
      ) : null}
    </View>
  );
};
