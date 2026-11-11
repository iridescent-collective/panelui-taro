import { View } from "@tarojs/components";
import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import type { ComponentRef } from "react";

import { formatColor, parseColor } from "../../lib/color";
import type { HsvaColor } from "../../lib/color";
import { createObservableValue } from "../../primitives/observable-value";
import { Popover } from "../Popover";
import { ColorPickerContext } from "./context";
import type { ColorPickerProps } from "./types";
import { colorPickerVariants } from "./variants";

export const ColorPickerRoot = forwardRef<
  ComponentRef<typeof View>,
  ColorPickerProps
>(
  (
    {
      className,
      value,
      defaultValue = "#ff0000",
      onValueChange,
      onValueCommit,
      format = "hex",
      disabled = false,
      haptics = false,
      size = "md",
      presentation = "inline",
      open,
      onOpenChange,
      children,
    },
    ref
  ) => {
    const slots = colorPickerVariants({ disabled, size });
    const signal = useMemo(
      () =>
        createObservableValue(
          parseColor(value ?? defaultValue) ?? { a: 1, h: 0, s: 1, v: 1 }
        ),
      []
    );
    const latest = useRef({ format, onValueChange, onValueCommit });
    latest.current = { format, onValueChange, onValueCommit };
    const lastEmitted = useRef<string | null>(null);
    const emit = useCallback(
      (color: HsvaColor, commit: boolean) => {
        signal.value = color;
        const next = formatColor(color, latest.current.format);
        lastEmitted.current = next;
        latest.current.onValueChange?.(next);
        if (commit) {
          latest.current.onValueCommit?.(next);
        }
      },
      [signal]
    );
    useEffect(() => {
      if (value === undefined || value === lastEmitted.current) {
        return;
      }
      const parsed = parseColor(value);
      if (parsed) {
        signal.value = parsed;
      }
    }, [value, signal]);
    const context = useMemo(
      () => ({ disabled, emit, format, haptics, signal, size }),
      [signal, emit, format, disabled, haptics, size]
    );
    if (presentation !== "inline") {
      return (
        <ColorPickerContext.Provider value={context}>
          <Popover
            open={open}
            onOpenChange={onOpenChange}
            presentation={presentation}
          >
            {children}
          </Popover>
        </ColorPickerContext.Provider>
      );
    }
    return (
      <ColorPickerContext.Provider value={context}>
        <View
          ref={ref}
          className={slots.root({
            className: `flex flex-col ${className ?? ""}`,
          })}
        >
          {children}
        </View>
      </ColorPickerContext.Provider>
    );
  }
);
ColorPickerRoot.displayName = "ColorPicker";
