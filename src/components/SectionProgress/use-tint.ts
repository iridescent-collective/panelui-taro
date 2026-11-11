import { useEffect, useRef, useState } from "react";

import { easeInOutQuad } from "../../lib/easing";
import { interpolatePanelColor } from "../../lib/interpolate-color";

export const useSectionProgressTint = (target: string, reduced: boolean) => {
  const [tint, setTint] = useState(target);
  const previous = useRef(target);
  useEffect(() => {
    const from = previous.current;
    previous.current = target;
    if (from === target || reduced) {
      setTint(target);
      return;
    }
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    setTint(from);
    const draw = () => {
      const elapsed = Date.now() - started;
      setTint(
        interpolatePanelColor(
          from,
          target,
          easeInOutQuad(Math.min(1, elapsed / 240))
        )
      );
      if (elapsed < 240) {
        timer = setTimeout(draw, Math.min(16, 240 - elapsed));
      }
    };
    timer = setTimeout(draw, 16);
    return () => clearTimeout(timer);
  }, [target, reduced]);
  return tint;
};
