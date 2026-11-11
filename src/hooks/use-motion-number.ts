import { useCallback, useEffect, useMemo, useRef } from "react";

import { easeInOutQuad } from "../lib/easing";
import type { SourceSpringConfig } from "../lib/source-spring";
import { createObservableNumber } from "../primitives/observable-number";
import { useSourceSpringController } from "./use-source-spring";

export const useMotionNumber = (
  initial: number,
  config: SourceSpringConfig
) => {
  const signal = useMemo(() => createObservableNumber(initial), []);
  const publish = useCallback(
    (value: number) => {
      signal.value = value;
    },
    [signal]
  );
  const controller = useSourceSpringController(initial, config, false, publish);
  const latest = useRef(controller);
  latest.current = controller;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revision = useRef(0);
  const stopTiming = useCallback(() => {
    revision.current += 1;
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);
  const setImmediate = useCallback(
    (value: number) => {
      stopTiming();
      latest.current.setImmediate(value);
    },
    [stopTiming]
  );
  const springTo = useCallback(
    (value: number, velocity?: number) => {
      stopTiming();
      latest.current.springTo(value, velocity);
    },
    [stopTiming]
  );
  const timingTo = useCallback(
    (target: number, duration: number) => {
      stopTiming();
      const request = revision.current;
      const from = latest.current.read();
      latest.current.setImmediate(from);
      if (request !== revision.current) {
        return;
      }
      if (duration <= 0 || from === target) {
        latest.current.setImmediate(target);
        return;
      }
      const started = Date.now();
      const draw = () => {
        if (request !== revision.current) {
          return;
        }
        const elapsed = Date.now() - started;
        latest.current.setImmediate(
          from +
            (target - from) * easeInOutQuad(Math.min(1, elapsed / duration))
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
    [stopTiming]
  );
  useEffect(
    () =>
      signal.subscribe(() => {
        if (signal.value !== latest.current.read()) {
          stopTiming();
          latest.current.setImmediate(signal.value);
        }
      }),
    [signal, stopTiming]
  );
  useEffect(() => stopTiming, [stopTiming]);
  return { read: controller.read, setImmediate, signal, springTo, timingTo };
};
