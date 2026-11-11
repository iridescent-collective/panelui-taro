import { useEffect, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSourceSpringController } from "../../hooks/use-source-spring";
import { useChartTween } from "../../primitives/chart-tween";
import { POPOVER_ENTRY_SHIFT } from "./placement";
import type { PopoverPlacement } from "./types";

// Match Native Popover's withSpring; a CSS ease-out loses its overshoot.
const ENTRY_SPRING = { damping: 18, stiffness: 250, mass: 0.6 };
const CLAMPED_ENTRY_SPRING = { ...ENTRY_SPRING, overshootClamping: true };
export const usePopoverMotion = (
  open: boolean,
  placed: boolean,
  placement: PopoverPlacement = "bottom",
  overshootClamping = false
) => {
  const reduced = usePanelReducedMotion();
  // Closing only fades the panel. Keep the entry spring independent of open,
  // as Native does, so dismissal does not shrink back towards the trigger.
  const spring = useSourceSpringController(
    0,
    overshootClamping ? CLAMPED_ENTRY_SPRING : ENTRY_SPRING,
    reduced
  );
  useEffect(() => {
    if (placed) {
      spring.springTo(1);
    } else {
      spring.setImmediate(0);
    }
  }, [
    placed,
    reduced,
    overshootClamping,
    spring.setImmediate,
    spring.springTo,
  ]);
  const settle = useSyncExternalStore(
    spring.signal.subscribe,
    spring.signal.getSnapshot,
    spring.signal.getSnapshot
  );
  const fade = useChartTween(0);
  useEffect(() => {
    if (!placed) {
      fade.setImmediate(0);
    } else {
      fade.timingTo(open ? 1 : 0, reduced ? 0 : 120);
    }
  }, [open, placed, reduced, fade.setImmediate, fade.timingTo]);
  const opacity = useSyncExternalStore(
    fade.signal.subscribe,
    fade.signal.getSnapshot,
    fade.signal.getSnapshot
  );
  const origin = POPOVER_ENTRY_SHIFT[placement];
  return {
    opacity: placed ? opacity : 0,
    transform: reduced
      ? "none"
      : `translate(${origin.x * (1 - settle) * 2}rpx,${origin.y * (1 - settle) * 2}rpx) scale(${0.94 + 0.06 * settle})`,
    transition: "none",
  };
};
