import {
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useSyncExternalStore,
} from "react";

import { startSourceSpring, stepSourceSpring } from "../lib/source-spring";
import type { SourceSpringConfig } from "../lib/source-spring";
import { createObservableNumber } from "../primitives/observable-number";

export const useSourceSpringController = (
  initial: number,
  config: SourceSpringConfig,
  reduced: boolean,
  onValue?: (value: number) => void
) => {
  const signal = useMemo(() => createObservableNumber(initial), []);
  const model = useRef(startSourceSpring(initial, initial, 0, config));
  const settings = useRef({ config, onValue, reduced });
  settings.current = { config, onValue, reduced };
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const revision = useRef(0);
  const stop = useCallback(() => {
    revision.current += 1;
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);
  const publish = useCallback(() => {
    if (!mounted.current) {
      return;
    }
    const next = model.current.position;
    const request = revision.current;
    signal.value = next;
    if (request === revision.current) {
      settings.current.onValue?.(next);
    }
  }, [signal]);
  const setImmediate = useCallback(
    (next: number) => {
      stop();
      model.current = startSourceSpring(next, next, 0, settings.current.config);
      publish();
    },
    [stop, publish]
  );
  const springTo = useCallback(
    (target: number, velocity?: number) => {
      stop();
      const { current } = settings;
      if (current.reduced || current.config.duration === 0) {
        setImmediate(target);
        return;
      }
      if (model.current.position === target && model.current.velocity === 0) {
        return;
      }
      const nextConfig =
        velocity === undefined
          ? current.config
          : { ...current.config, velocity };
      model.current = startSourceSpring(
        model.current.position,
        target,
        velocity ?? model.current.velocity,
        nextConfig
      );
      const request = revision.current;
      let last = Date.now();
      const draw = () => {
        if (request !== revision.current) {
          return;
        }
        const now = Date.now();
        const done = stepSourceSpring(model.current, now - last);
        last = now;
        publish();
        if (request !== revision.current) {
          return;
        }
        timer.current = done ? null : setTimeout(draw, 16);
      };
      timer.current = setTimeout(draw, 16);
    },
    [stop, setImmediate, publish]
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stop();
    };
  }, [stop]);
  const read = useCallback(() => model.current.position, []);
  return { read, setImmediate, signal, springTo };
};
export const useSourceSpring = (
  target: number,
  config: SourceSpringConfig,
  reduced: boolean,
  initial = target
) => {
  const controller = useSourceSpringController(initial, config, reduced);
  useEffect(() => {
    controller.springTo(target);
  }, [
    target,
    reduced,
    config.damping,
    config.dampingRatio,
    config.duration,
    config.energyThreshold,
    config.mass,
    config.overshootClamping,
    config.stiffness,
    config.velocity,
    controller.springTo,
  ]);
  return useSyncExternalStore(
    controller.signal.subscribe,
    controller.signal.getSnapshot,
    controller.signal.getSnapshot
  );
};
