import { useCallback, useEffect, useMemo, useState } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSpringNumber } from "../../hooks/use-spring-number";
import { createObservableNumber } from "../../primitives/observable-number";
import { SPRING } from "./constants";
import type { FlipControllerOptions } from "./types";
import { useFlipDrag } from "./use-drag";

export const useFlipController = ({
  children,
  className,
  style,
  id,
  direction,
  rotation,
  trigger,
  perspective,
  flipped: flippedProp,
  defaultFlipped,
  onFlippedChange,
}: FlipControllerOptions) => {
  const [internal, setInternal] = useState(defaultFlipped);
  const controlled = flippedProp !== undefined;
  const flipped = controlled ? flippedProp : internal;
  const reduced = usePanelReducedMotion();
  const [initialProgress] = useState(defaultFlipped ? 1 : 0);
  const motion = useSpringNumber(initialProgress, SPRING, reduced);
  const [progress] = useState(() =>
    createObservableNumber(defaultFlipped ? 1 : 0)
  );
  const layoutInputs = useMemo(
    () => ({ children, className, style }),
    [children, className, style]
  );
  const layout = useElementLayout(true, layoutInputs, id, false);
  const settle = useCallback(
    (next: boolean) => {
      if (!controlled) {
        setInternal(next);
      }
      onFlippedChange?.(next);
    },
    [controlled, onFlippedChange]
  );
  const flip = useCallback(() => settle(!flipped), [flipped, settle]);
  useEffect(() => {
    if (reduced) {
      motion.setImmediate(flipped ? 1 : 0);
    } else {
      motion.springTo(flipped ? 1 : 0);
    }
  }, [flipped, reduced, motion.setImmediate, motion.springTo]);
  useEffect(() => {
    progress.value = motion.value;
  }, [progress, motion.value]);
  const drag = useFlipDrag({
    direction,
    flipped,
    motion,
    settle,
    span: layout.layout?.[direction === "horizontal" ? "width" : "height"] ?? 0,
    trigger,
  });
  const context = useMemo(
    () => ({ direction, flip, flipped, perspective, progress, rotation }),
    [flipped, direction, rotation, perspective, progress, flip]
  );
  return { context, drag, flip, flipped, layout, motion };
};
