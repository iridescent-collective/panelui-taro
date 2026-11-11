import { View } from "@tarojs/components";
import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
} from "react";
import type { ComponentRef } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { resolvePressableAccessibility } from "../../primitives/pressable-accessibility";
import { ProgressButtonContext } from "./context";
import { ProgressButtonLabel, ProgressButtonDone } from "./parts";
import type { ProgressButtonProps } from "./types";
import { useDone } from "./use-done";
import { useHoldGesture } from "./use-gesture";
import { useHold } from "./use-hold";
import { progressButtonVariants } from "./variants";

export type {
  ProgressButtonProps,
  ProgressButtonLabelProps,
  ProgressButtonDoneProps,
  ProgressButtonVariant,
  ProgressButtonSize,
  ProgressButtonShape,
} from "./types";
export { useProgressButton } from "./context";
export {
  DEFAULT_AUTO_RESET_DELAY,
  DEFAULT_HOLD_DURATION,
  DEFAULT_RELEASE_DURATION,
  fillDuration,
  isComplete,
  releaseDuration,
  resolveHoldDuration,
} from "./progress-button-hold";
const ProgressButtonRoot = forwardRef<
  ComponentRef<typeof View>,
  ProgressButtonProps
>((props, ref) => {
  const {
    className,
    variant = "primary",
    size = "md",
    shape = "pill",
    fullWidth,
    holdDuration: _holdDuration,
    onComplete: _onComplete,
    onCompletedChange: _onCompletedChange,
    completed: _completed,
    autoReset: _autoReset,
    autoResetDelay: _autoResetDelay,
    disabled = false,
    haptics: _haptics,
    accessibilityState,
    accessibilityLabel,
    accessibilityHint: _accessibilityHint,
    accessibilityRole: _accessibilityRole,
    onPressIn: _onPressIn,
    onPressOut: _onPressOut,
    pressScale: _pressScale,
    pressOpacity: _pressOpacity,
    onPress,
    onClick,
    hitSlop,
    onLayout,
    children,
    id,
    style,
    ...native
  } = props;
  const reduced = usePanelReducedMotion();
  const input = useMemo(
    () => ({ children, className, fullWidth, shape, size, style, variant }),
    [className, variant, size, shape, fullWidth, children, style]
  );
  const measured = useElementLayout(true, input, id, false);
  const width = Math.round(measured.layout?.width ?? 0);
  const hold = useHold(props, reduced, width > 0);
  const done = useDone(hold.completed, reduced);
  const edges =
    typeof hitSlop === "number"
      ? { bottom: hitSlop, left: hitSlop, right: hitSlop, top: hitSlop }
      : hitSlop;
  const gesture = useHoldGesture(
    hold,
    measured.layout,
    disabled,
    reduced,
    edges,
    measured.refresh
  );
  const slots = progressButtonVariants({
    disabled,
    fullWidth,
    shape,
    size,
    variant,
  });
  useEffect(() => {
    if (measured.layout) {
      onLayout?.(measured.layout);
    }
  }, [measured.layout, onLayout]);
  const written = Children.toArray(children);
  const hasDone = written.some(
    (child) => isValidElement(child) && child.type === ProgressButtonDone
  );
  const body =
    written.length > 0 ? (
      written
    ) : (
      <ProgressButtonLabel>Hold to confirm</ProgressButtonLabel>
    );
  return (
    <ProgressButtonContext.Provider
      value={{
        completed: hold.completed,
        done,
        progress: hold.progress,
        size,
        slots,
        variant,
        width,
      }}
    >
      <View
        {...native}
        ref={ref}
        id={measured.id}
        style={edges ? mergeStyleAfter(style, { overflow: "visible" }) : style}
        className={cn(slots.root({ className }), edges && "overflow-visible")}
        {...resolvePressableAccessibility(props, {
          disabled,
          hint: "Press and hold to confirm",
          label: accessibilityLabel,
          role: "button",
          state: { ...accessibilityState, checked: hold.completed, disabled },
        })}
        catchMove={!disabled}
        onTouchStart={(event) => {
          props.onTouchStart?.(event);
          gesture.onTouchStart(event);
        }}
        onTouchMove={(event) => {
          props.onTouchMove?.(event);
          gesture.onTouchMove(event);
        }}
        onTouchEnd={(event) => {
          props.onTouchEnd?.(event);
          gesture.onTouchEnd(event);
        }}
        onTouchCancel={(event) => {
          props.onTouchCancel?.(event);
          gesture.onTouchCancel();
        }}
        onClick={(event) => {
          if (!disabled) {
            (onPress ?? onClick)?.(event);
          }
        }}
      >
        {edges ? (
          <>
            <View
              aria-hidden
              data-panel-hold-hit="true"
              style={{
                bottom: `${-(edges.bottom ?? 0) * 2}rpx`,
                left: `${-(edges.left ?? 0) * 2}rpx`,
                position: "absolute",
                right: `${-(edges.right ?? 0) * 2}rpx`,
                top: `${-(edges.top ?? 0) * 2}rpx`,
              }}
            />
            <View
              data-panel-hold-visual="true"
              style={{
                borderRadius: "inherit",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {body}
              {hasDone ? null : <ProgressButtonDone />}
            </View>
          </>
        ) : (
          <>
            {body}
            {hasDone ? null : <ProgressButtonDone />}
          </>
        )}
      </View>
    </ProgressButtonContext.Provider>
  );
});
ProgressButtonRoot.displayName = "ProgressButton";
export const ProgressButton = Object.assign(ProgressButtonRoot, {
  Done: ProgressButtonDone,
  Label: ProgressButtonLabel,
});
