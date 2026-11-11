import { useCallback, useEffect, useRef, useState } from "react";

export interface SpringConfig {
  damping: number;
  stiffness: number;
  mass: number;
  overshootClamping?: boolean;
  restDisplacementThreshold?: number;
  restSpeedThreshold?: number;
}
export const useSpringNumber = (
  initial: number,
  config: SpringConfig,
  still: boolean,
  onValue?: (value: number) => void,
  followTarget = true
) => {
  const [value, setValue] = useState(initial);
  const model = useRef({ position: initial, target: initial, velocity: 0 });
  const settings = useRef({ config, onValue, still });
  settings.current = { config, onValue, still };
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const mounted = useRef(true);
  const completion = useRef<((finished: boolean) => void) | undefined>();
  const revision = useRef(0);
  const stop = useCallback(() => {
    revision.current += 1;
    const previous = completion.current;
    completion.current = undefined;
    if (timer.current !== undefined) {
      clearTimeout(timer.current);
      timer.current = undefined;
    }
    previous?.(false);
  }, []);
  const setImmediate = useCallback(
    (next: number) => {
      stop();
      model.current = { position: next, target: next, velocity: 0 };
      if (mounted.current) {
        setValue(next);
        settings.current.onValue?.(next);
      }
    },
    [stop]
  );
  const springTo = useCallback(
    (
      target: number,
      velocity?: number,
      onFinish?: (finished: boolean) => void
    ) => {
      if (settings.current.still) {
        setImmediate(target);
        onFinish?.(true);
        return;
      }
      if (
        model.current.target === target &&
        timer.current !== undefined &&
        velocity === undefined &&
        onFinish === undefined
      ) {
        return;
      }
      stop();
      completion.current = onFinish;
      const request = revision.current;
      model.current.target = target;
      model.current.velocity = velocity ?? model.current.velocity;
      let previous = Date.now();
      const started = previous;
      const frame = () => {
        if (request !== revision.current) {
          return;
        }
        timer.current = undefined;
        if (!mounted.current) {
          return;
        }
        const now = Date.now();
        const elapsed = Math.min(Math.max(now - previous, 1), 64) / 1000;
        previous = now;
        const divisions = Math.ceil(elapsed / 0.008);
        const step = elapsed / divisions;
        const {
          damping,
          stiffness,
          mass,
          overshootClamping,
          restDisplacementThreshold = 0.001,
          restSpeedThreshold = 0.001,
        } = settings.current.config;
        const { current } = model;
        for (let division = 0; division < divisions; division += 1) {
          const previousDistance = current.position - current.target;
          const acceleration =
            ((current.target - current.position) * stiffness -
              current.velocity * damping) /
            mass;
          current.velocity += acceleration * step;
          current.position += current.velocity * step;
          if (
            overshootClamping &&
            previousDistance * (current.position - current.target) < 0
          ) {
            current.position = current.target;
            current.velocity = 0;
          }
        }
        const settled =
          Math.abs(current.target - current.position) <
            restDisplacementThreshold &&
          Math.abs(current.velocity) < restSpeedThreshold;
        if (settled || now - started >= 2000) {
          current.position = current.target;
          current.velocity = 0;
        }
        setValue(current.position);
        settings.current.onValue?.(current.position);
        if (request !== revision.current) {
          return;
        }
        if (settled || now - started >= 2000) {
          const finished = completion.current;
          completion.current = undefined;
          finished?.(true);
        }
        if (!settled && now - started < 2000) {
          timer.current = setTimeout(frame, 16);
        }
      };
      timer.current = setTimeout(frame, 16);
    },
    [setImmediate, stop]
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stop();
    };
  }, [stop]);
  useEffect(() => {
    if (followTarget) {
      springTo(initial);
    }
  }, [initial, still, followTarget, springTo]);
  const read = useCallback(() => model.current.position, []);
  return { read, setImmediate, springTo, value };
};
