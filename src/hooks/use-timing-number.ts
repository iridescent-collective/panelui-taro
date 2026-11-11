import { useEffect, useRef, useState } from "react";

import { easeInOutQuad } from "../lib/easing";

export const useTimingNumber = (
  target: number,
  duration: number,
  reduced: boolean,
  initial = target
) => {
  const [value, setValue] = useState(initial);
  const displayed = useRef(initial);
  useEffect(() => {
    if (reduced || duration <= 0) {
      displayed.current = target;
      setValue(target);
      return;
    }
    const from = displayed.current;
    if (from === target) {
      return;
    }
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    const draw = () => {
      const elapsed = Date.now() - started;
      displayed.current =
        from + (target - from) * easeInOutQuad(Math.min(1, elapsed / duration));
      setValue(displayed.current);
      if (elapsed < duration) {
        timer = setTimeout(draw, Math.min(16, duration - elapsed));
      }
    };
    timer = setTimeout(draw, Math.min(16, duration));
    return () => clearTimeout(timer);
  }, [target, duration, reduced]);
  return value;
};
