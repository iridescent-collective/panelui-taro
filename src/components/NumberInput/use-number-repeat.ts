import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";

import { normalize } from "./number-input-math";
import { createRepeater } from "./number-input-repeat";

const REPEAT_DELAY = 400;
const REPEAT_INTERVAL = 80;
export const useNumberRepeat = (
  valueRef: RefObject<number>,
  commit: (value: number, tick: boolean) => Promise<void>,
  {
    disabled,
    step,
    min,
    max,
  }: { disabled?: boolean; step: number; min: number; max: number }
) => {
  const latest = useRef(commit);
  latest.current = commit;
  const repeaterRef = useRef<ReturnType<typeof createRepeater> | null>(null);
  if (!repeaterRef.current) {
    repeaterRef.current = createRepeater(REPEAT_DELAY, REPEAT_INTERVAL);
  }
  const repeater = repeaterRef.current;
  const { stop } = repeater;
  useEffect(() => stop, [stop]);
  useEffect(() => {
    if (disabled) {
      stop();
    }
  }, [disabled, stop]);
  const start = useCallback(
    (direction: 1 | -1) => {
      if (disabled) {
        return;
      }
      repeater.start(() => {
        const current = valueRef.current ?? 0;
        const next = normalize(current + direction * step, min, max, step);
        if (next === current) {
          return false;
        }
        void latest.current(next, true);
        return direction > 0 ? next < max : next > min;
      });
    },
    [disabled, repeater, valueRef, step, min, max]
  );
  return { start, stop };
};
