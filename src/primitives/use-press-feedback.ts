import type { Button } from "@tarojs/components";
import { useEffect, useId, useRef, useState } from "react";
import type { ComponentProps, CSSProperties } from "react";

import { usePanelReducedMotion } from "../hooks/use-reduced-motion";
import { mergeStyle, mergeStyleAfter } from "../lib/styles";
import { PRESS_RELEASE_DURATION } from "./press-feedback-constants";
import { useRestingOpacity } from "./use-resting-opacity";

type TouchEvent = Parameters<
  NonNullable<ComponentProps<typeof Button>["onTouchStart"]>
>[0];
export interface PressFeedbackOptions<Event = TouchEvent> {
  disabled?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties | string;
  pressScale?: number;
  pressOpacity?: number;
  onPressIn?: (event: Event) => void;
  onPressOut?: (event: Event) => void;
  onTouchStart?: (event: Event) => void;
  onTouchEnd?: (event: Event) => void;
  onTouchCancel?: (event: Event) => void;
}

export const usePressFeedback = <Event = TouchEvent>({
  disabled,
  id: givenId,
  className,
  style,
  pressScale = 0.97,
  pressOpacity = 1,
  onPressIn,
  onPressOut,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: PressFeedbackOptions<Event>) => {
  const generatedId = `panelui-press-${useId().replaceAll(":", "")}`;
  const id = givenId ?? generatedId;
  const [pressed, setPressed] = useState(false);
  const restingOpacity = useRestingOpacity(
    id,
    pressOpacity !== 1 && !disabled,
    className,
    style,
    pressed
  );
  const active = useRef(false);
  const reducedMotion = usePanelReducedMotion();
  useEffect(() => {
    if (disabled) {
      active.current = false;
      setPressed(false);
    }
  }, [disabled]);
  const finish = (event: Event, cancelled: boolean) => {
    const wasActive = active.current;
    active.current = false;
    setPressed(false);
    if (wasActive) {
      onPressOut?.(event);
    }
    if (cancelled) {
      onTouchCancel?.(event);
    } else {
      onTouchEnd?.(event);
    }
  };
  let transition = `transform ${PRESS_RELEASE_DURATION}ms cubic-bezier(0.22,1,0.36,1), opacity ${PRESS_RELEASE_DURATION}ms ease-out`;
  if (pressed) {
    transition = "transform 80ms ease-in-out, opacity 80ms ease-in-out";
  }
  if (reducedMotion) {
    transition = "none";
  }
  const opacity =
    pressed && !disabled && pressOpacity !== 1
      ? restingOpacity * pressOpacity
      : undefined;
  const motionStyle = {
    transform: `scale(${pressed && !disabled && !reducedMotion ? pressScale : 1})`,
    transition,
  };
  const merged = mergeStyle(motionStyle, style);
  return {
    id,
    mergedStyle:
      opacity === undefined ? merged : mergeStyleAfter(merged, { opacity }),
    onTouchCancel: (event: Event) => finish(event, true),
    onTouchEnd: (event: Event) => finish(event, false),
    onTouchStart: (event: Event) => {
      if (disabled) {
        return;
      }
      if (!active.current) {
        active.current = true;
        setPressed(true);
        onPressIn?.(event);
      }
      onTouchStart?.(event);
    },
    pressed,
    style: {
      opacity,
      transform: `scale(${pressed && !disabled && !reducedMotion ? pressScale : 1})`,
      transition,
    },
  };
};
