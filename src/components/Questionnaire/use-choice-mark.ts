import { useEffect, useSyncExternalStore } from "react";

import { useMotionNumber } from "../../hooks/use-motion-number";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";

const CHOICE_SPRING = { damping: 15, mass: 0.5, stiffness: 300 };
export const useChoiceMark = (selected: boolean) => {
  const reduced = usePanelReducedMotion();
  const motion = useMotionNumber(selected ? 1 : 0, CHOICE_SPRING);
  useEffect(() => {
    if (reduced) {
      motion.setImmediate(selected ? 1 : 0);
    } else if (selected) {
      motion.springTo(1);
    } else {
      motion.timingTo(0, 120);
    }
  }, [
    selected,
    reduced,
    motion.setImmediate,
    motion.springTo,
    motion.timingTo,
  ]);
  return useSyncExternalStore(
    motion.signal.subscribe,
    motion.signal.getSnapshot,
    motion.signal.getSnapshot
  );
};
