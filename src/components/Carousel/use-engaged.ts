import { useCallback, useEffect, useMemo, useRef } from "react";

import { easeInOutQuad } from "../../lib/easing";
import { createObservableNumber } from "../../primitives/observable-number";

export const useCarouselEngaged = (reduced: boolean) => {
  const signal = useMemo(() => createObservableNumber(0), []);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(reduced);
  latest.current = reduced;
  const stop = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    timer.current = null;
  }, []);
  const set = useCallback(
    (target: number) => {
      stop();
      if (latest.current) {
        signal.value = target;
        return;
      }
      const from = signal.value;
      const duration = target === 1 ? 160 : 220;
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        signal.value =
          from +
          (target - from) * easeInOutQuad(Math.min(1, elapsed / duration));
        timer.current =
          elapsed < duration
            ? setTimeout(tick, Math.min(16, duration - elapsed))
            : null;
      };
      timer.current = setTimeout(tick, Math.min(16, duration));
    },
    [signal, stop]
  );
  useEffect(() => stop, [stop]);
  return { set, signal };
};
