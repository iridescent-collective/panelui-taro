import { useEffect, useRef, useSyncExternalStore } from "react";

import { useMotionNumber } from "../../hooks/use-motion-number";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import type { ThemeToken } from "../../theme/types";
import { useThemeToken } from "../../theme/use-theme";
import { POP } from "./utils";

export const usePostToken = (token: string) =>
  useThemeToken(token.replace("--color-", "") as ThemeToken);
export const usePostPop = (
  active: boolean,
  duration: number,
  initial: number,
  peak: number,
  rest: number
) => {
  const reduced = usePanelReducedMotion();
  const motion = useMotionNumber(initial, POP);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) {
      motion.setImmediate(rest);
      return;
    }
    motion.timingTo(peak, duration);
    const timer = setTimeout(() => motion.springTo(rest), duration);
    return () => clearTimeout(timer);
  }, [
    active,
    reduced,
    duration,
    peak,
    rest,
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
