import { useEffect, useRef, useState } from "react";

export const useBarHeight = (
  height: number,
  delay: number,
  reduced: boolean
) => {
  const [grown, setGrown] = useState(reduced ? height : 0);
  const current = useRef(grown);
  useEffect(() => {
    if (reduced) {
      current.current = height;
      setGrown(height);
      return;
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    const pending = setTimeout(() => {
      const from = current.current;
      const started = Date.now();
      timer = setInterval(() => {
        const progress = Math.min(1, (Date.now() - started) / 620);
        const next = from + (height - from) * (1 - (1 - progress) ** 3);
        current.current = next;
        setGrown(next);
        if (progress === 1) {
          clearInterval(timer);
        }
      }, 16);
    }, delay);
    return () => {
      clearTimeout(pending);
      if (timer !== undefined) {
        clearInterval(timer);
      }
    };
  }, [height, delay, reduced]);
  return grown;
};
