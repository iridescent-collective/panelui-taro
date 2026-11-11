import { useCallback, useMemo, useState } from "react";

import { KeyboardAvoider } from "../../primitives/keyboard-avoider";
import { RADIUS } from "./constants";
import { AIInputContext } from "./context";
import type { AIInputContextValue } from "./context";
import { Glass, hasNativeUI } from "./surface";
import type { AIInputProps } from "./types";
import { aiInputVariants } from "./variants";

export const AIInputRoot = ({
  children,
  className,
  value: valueProp,
  onValueChange,
  defaultValue = "",
  status = "ready",
  onSubmit,
  onStop,
  onVoice,
  onRecordCancel,
  onRecordConfirm,
  level,
  size = "md",
  disabled = false,
  native = false,
  minRows = 1,
  maxRows = 5,
  avoidKeyboard = true,
  keyboardBottomInset = 0,
  keyboardGap = 8,
  style,
  ...props
}: AIInputProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;
  const [focused, setFocused] = useState(false);
  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );
  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (disabled || !trimmed) {
      return;
    }
    onSubmit?.(value);
  }, [disabled, onSubmit, value]);
  const platformControls = native && hasNativeUI();
  const context = useMemo<AIInputContextValue>(
    () => ({
      canStop: onStop !== undefined,
      canVoice: onVoice !== undefined,
      disabled,
      focused,
      level,
      maxRows,
      minRows,
      native: platformControls,
      recordCancel: () => {
        if (!disabled) {
          onRecordCancel?.();
        }
      },
      recordConfirm: () => {
        if (!disabled) {
          onRecordConfirm?.();
        }
      },
      setFocused,
      setValue,
      size,
      status,
      stop: () => {
        if (!disabled) {
          onStop?.();
        }
      },
      submit,
      value,
      voice: () => {
        if (!disabled) {
          onVoice?.();
        }
      },
    }),
    [
      value,
      setValue,
      status,
      size,
      level,
      disabled,
      platformControls,
      minRows,
      maxRows,
      focused,
      submit,
      onStop,
      onVoice,
      onRecordCancel,
      onRecordConfirm,
      onVoice,
    ]
  );
  const slots = aiInputVariants({ disabled, size });
  const surface = (
    <Glass
      radius={RADIUS[size]}
      fallbackClassName="border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)]"
      {...props}
      className={slots.root({ className })}
      style={style}
    >
      {children}
    </Glass>
  );
  return (
    <AIInputContext.Provider value={context}>
      {avoidKeyboard ? (
        <KeyboardAvoider
          active={focused}
          mode="dock"
          bottomInset={keyboardBottomInset - keyboardGap}
          className="w-full"
        >
          {surface}
        </KeyboardAvoider>
      ) : (
        surface
      )}
    </AIInputContext.Provider>
  );
};
