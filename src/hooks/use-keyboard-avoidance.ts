import { useEffect, useRef, useState } from "react";

import { useElementLayout } from "./use-element-layout";
import { useKeyboard } from "./use-keyboard";
import { usePanelReducedMotion } from "./use-reduced-motion";
import { useWindowMetrics } from "./use-window-metrics";

export type KeyboardAvoidanceMode = "lift" | "dock";
export interface UseKeyboardAvoidanceOptions {
  enabled?: boolean;
  active?: boolean;
  mode?: KeyboardAvoidanceMode;
  offset?: number;
  bottomInset?: number;
  id?: string;
}
export const keyboardLift = (
  bottom: number,
  translation: number,
  screenHeight: number,
  keyboardHeight: number,
  offset: number
) =>
  -Math.max(
    0,
    bottom - translation + offset - (screenHeight - Math.abs(keyboardHeight))
  );
export const hasKeyboardController = () => false;
export const useKeyboardAvoidance = ({
  enabled = true,
  active = true,
  mode = "lift",
  offset = 16,
  bottomInset = 0,
  id,
}: UseKeyboardAvoidanceOptions = {}) => {
  const { height } = useKeyboard();
  const window = useWindowMetrics();
  const reduced = usePanelReducedMotion();
  const measurement = useElementLayout(
    enabled && active && mode === "lift",
    undefined,
    id
  );
  const [translation, setTranslation] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    if (!enabled || !active || height === 0 || mode !== "lift") {
      current.current = 0;
      setTranslation(0);
      return;
    }
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const track = () =>
      measurement.refresh(
        () => mounted,
        (rect) => {
          if (!rect || rect.height <= 0) {
            return;
          }
          const next = keyboardLift(
            rect.top + rect.height,
            current.current,
            window.height,
            height,
            offset
          );
          if (Math.abs(next - current.current) > 0.5) {
            current.current = next;
            setTranslation(next);
          }
          timer = setTimeout(track, 32);
        }
      );
    track();
    return () => {
      mounted = false;
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [
    enabled,
    active,
    height,
    mode,
    offset,
    window.height,
    measurement.refresh,
    measurement.layout,
  ]);
  const dock = enabled && active ? -Math.max(height - bottomInset, 0) : 0;
  const value = mode === "dock" ? dock : translation;
  return {
    animatedStyle: {
      transform: `translateY(${value * 2}rpx)`,
      transition:
        reduced || (mode === "lift" && height > 0 && active && enabled)
          ? "none"
          : "transform 200ms ease",
    },
    id: measurement.id,
    layout: measurement.layout,
  };
};
