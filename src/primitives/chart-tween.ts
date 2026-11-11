import { useCallback, useEffect, useMemo, useRef } from "react";

import { createObservableNumber } from "./observable-number";

export const chartLinear = (value: number) => value;
export const chartCubicOut = (value: number) => 1 - (1 - value) ** 3;
export const chartInOutQuad = (value: number) =>
  value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;
export const useChartTween = (
  initial: number,
  easing = chartInOutQuad,
  onValue?: (value: number) => void
) => {
  const signal = useMemo(() => createObservableNumber(initial), []);
  const settings = useRef({ easing, onValue });
  settings.current = { easing, onValue };
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revision = useRef(0);
  const mounted = useRef(true);
  const stop = useCallback(() => {
    revision.current += 1;
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    timer.current = null;
  }, []);
  const publish = useCallback(
    (value: number) => {
      if (!mounted.current) {
        return;
      }
      const request = revision.current;
      signal.value = value;
      if (request === revision.current) {
        settings.current.onValue?.(value);
      }
    },
    [signal]
  );
  const setImmediate = useCallback(
    (value: number) => {
      stop();
      publish(value);
    },
    [publish, stop]
  );
  const timingTo = useCallback(
    (target: number, duration: number) => {
      stop();
      const request = revision.current;
      const from = signal.value;
      if (!Number.isFinite(duration) || duration <= 0 || from === target) {
        publish(target);
        return;
      }
      const start = Date.now();
      const draw = () => {
        if (!mounted.current || request !== revision.current) {
          return;
        }
        const elapsed = Date.now() - start;
        publish(
          from +
            (target - from) *
              settings.current.easing(Math.min(1, elapsed / duration))
        );
        if (request !== revision.current) {
          return;
        }
        timer.current =
          elapsed >= duration
            ? null
            : setTimeout(draw, Math.min(16, duration - elapsed));
      };
      timer.current = setTimeout(draw, Math.min(16, duration));
    },
    [publish, signal, stop]
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stop();
    };
  }, [stop]);
  return { setImmediate, signal, stop, timingTo };
};
