import { useCallback, useRef, useSyncExternalStore } from "react";

import { useMotionNumber } from "../../hooks/use-motion-number";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import type { CropState } from "./math";

const SPRING = { damping: 34, mass: 1, stiffness: 320 } as const;
const TURN_DURATION = 260;
export type CropMotionKind = "immediate" | "spring" | "timing";
export const useCropMotion = () => {
  const x = useMotionNumber(0, SPRING);
  const y = useMotionNumber(0, SPRING);
  const scale = useMotionNumber(1, SPRING);
  const rotation = useMotionNumber(0, SPRING);
  const reduced = usePanelReducedMotion();
  const current = useRef({ reduced, rotation, scale, x, y });
  current.current = { reduced, rotation, scale, x, y };
  const values = {
    rotation: useSyncExternalStore(
      rotation.signal.subscribe,
      rotation.read,
      rotation.read
    ),
    scale: useSyncExternalStore(scale.signal.subscribe, scale.read, scale.read),
    x: useSyncExternalStore(x.signal.subscribe, x.read, x.read),
    y: useSyncExternalStore(y.signal.subscribe, y.read, y.read),
  };
  const read = useCallback((): CropState => {
    const model = current.current;
    return {
      rotation: model.rotation.read(),
      scale: model.scale.read(),
      x: model.x.read(),
      y: model.y.read(),
    };
  }, []);
  const write = useCallback((target: CropState, kind: CropMotionKind) => {
    const model = current.current;
    for (const key of ["x", "y", "scale", "rotation"] as const) {
      const value = model[key];
      if (model.reduced || kind === "immediate") {
        value.setImmediate(target[key]);
      } else if (kind === "timing") {
        value.timingTo(target[key], TURN_DURATION);
      } else {
        value.springTo(target[key]);
      }
    }
  }, []);
  const stop = useCallback(() => {
    const value = read();
    write(value, "immediate");
    return value;
  }, [read, write]);
  return { read, stop, values, write };
};
