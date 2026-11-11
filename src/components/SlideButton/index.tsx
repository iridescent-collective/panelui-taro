import { View } from "@tarojs/components";
import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
} from "react";
import type { ComponentRef } from "react";

import { useDirectionSign } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { resolvePressableAccessibility } from "../../primitives/pressable-accessibility";
import { textChildren } from "../primitives/Text";
import { RAIL_INSET, THUMB_SIZE } from "./constants";
import { SlideButtonContext } from "./context";
import { SlideButtonFill, SlideButtonLabel, SlideButtonThumb } from "./parts";
import type { SlideButtonProps } from "./types";
import { useSlideAction } from "./use-action";
import { useSlideGesture } from "./use-gesture";
import { useSlideState } from "./use-state";
import { slideButtonVariants } from "./variants";

export type {
  SlideButtonProps,
  SlideButtonLabelProps,
  SlideButtonThumbProps,
  SlideButtonVariant,
  SlideButtonSize,
} from "./types";
export { useSlideButton } from "./context";
const SlideButtonRoot = forwardRef<ComponentRef<typeof View>, SlideButtonProps>(
  (props, ref) => {
    const {
      className,
      variant = "secondary",
      size = "md",
      fullWidth,
      threshold: _threshold,
      onComplete: _onComplete,
      onCompletedChange: _onCompletedChange,
      completed: _completed,
      autoReset: _autoReset,
      autoResetDelay: _autoResetDelay,
      disabled = false,
      haptics: _haptics,
      accessibilityActionLabel = "Confirm",
      accessibilityLabel: _label,
      accessibilityHint: _hint,
      accessibilityRole: _role,
      accessibilityState: _accessibilityState,
      children,
      id,
      onLayout,
      ...native
    } = props;
    const reduced = usePanelReducedMotion();
    const sign = useDirectionSign();
    const state = useSlideState(props, reduced);
    const input = useMemo(
      () => ({ children, className, fullWidth, size, style: native.style }),
      [children, className, size, fullWidth, native.style]
    );
    const measured = useElementLayout(true, input, id, false);
    const travel = Math.max(
      0,
      (measured.layout?.width ?? 0) - THUMB_SIZE[size].width - RAIL_INSET * 2
    );
    const gesture = useSlideGesture(state, {
      disabled,
      sign,
      threshold: props.threshold,
      travel,
    });
    const action = useSlideAction(props, state, gesture.onTouchCancel);
    const { active: _active, ...handlers } = gesture;
    const slots = slideButtonVariants({ disabled, fullWidth, size, variant });
    const hasThumb = Children.toArray(children).some(
      (child) => isValidElement(child) && child.type === SlideButtonThumb
    );
    useEffect(() => {
      if (measured.layout) {
        onLayout?.(measured.layout);
      }
    }, [measured.layout, onLayout]);
    return (
      <SlideButtonContext.Provider
        value={{
          completed: state.completed,
          done: state.done,
          progress: state.progress,
          size,
          slots,
          travel,
          variant,
        }}
      >
        <View
          {...native}
          ref={ref}
          id={measured.id}
          className={slots.root({ className })}
          {...resolvePressableAccessibility(props, {
            disabled,
            hint:
              props.accessibilityHint ??
              "Slide to confirm. Touch and hold for confirmation actions.",
            label: props.accessibilityLabel ?? accessibilityActionLabel,
            role: "button",
            state: {
              ...props.accessibilityState,
              checked: state.completed,
              disabled,
            },
          })}
          onLongPress={async (event) => {
            props.onLongPress?.(event);
            await action();
          }}
        >
          <SlideButtonFill />
          {textChildren(children, (text) => (
            <SlideButtonLabel>{text}</SlideButtonLabel>
          ))}
          {hasThumb ? null : <SlideButtonThumb />}
          <View
            id={`${measured.id}-touch`}
            aria-hidden
            style={{ inset: 0, position: "absolute" }}
            {...handlers}
            catchMove={!disabled && !state.completed}
            className="panelui-slide-surface"
          />
        </View>
      </SlideButtonContext.Provider>
    );
  }
);
SlideButtonRoot.displayName = "SlideButton";
export const SlideButton = Object.assign(SlideButtonRoot, {
  Label: SlideButtonLabel,
  Thumb: SlideButtonThumb,
});
