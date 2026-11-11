import { useCallback, useEffect, useState } from "react";

import { useSpringNumber } from "../../hooks/use-spring-number";
import { easeInOutQuad } from "../../lib/easing";
import { createObservableNumber } from "../../primitives/observable-number";

const DONE_SPRING = { damping: 14, mass: 0.6, stiffness: 220 } as const;
export const useDone = (completed: boolean, reduced: boolean) => {
  const [done] = useState(() => createObservableNumber(0));
  const publish = useCallback(
    (value: number) => {
      done.value = value;
    },
    [done]
  );
  const { setImmediate, springTo } = useSpringNumber(
    0,
    DONE_SPRING,
    reduced,
    publish,
    false
  );
  useEffect(() => {
    setImmediate(done.value);
    if (reduced) {
      setImmediate(completed ? 1 : 0);
      return;
    }
    if (completed) {
      springTo(1);
      return;
    }
    const from = done.value;
    if (from === 0) {
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.min(140, Date.now() - start);
      done.value = from * (1 - easeInOutQuad(elapsed / 140));
      if (elapsed === 140) {
        clearInterval(timer);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [completed, reduced, done, setImmediate, springTo]);
  return done;
};
