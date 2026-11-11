import { useEffect, useRef, useState } from "react";

export const useMarqueeOffset = (
  period: number,
  speed: number,
  moving: boolean
) => {
  const [offset, setOffset] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    current.current = 0;
    setOffset(0);
  }, [period]);
  useEffect(() => {
    if (!moving || period <= 0 || speed <= 0) {
      return;
    }
    const from = ((current.current % period) + period) % period;
    const started = Date.now();
    const timer = setInterval(() => {
      const next = (from + ((Date.now() - started) * speed) / 1000) % period;
      current.current = next;
      setOffset(next);
    }, 16);
    return () => clearInterval(timer);
  }, [period, speed, moving]);
  return offset;
};
