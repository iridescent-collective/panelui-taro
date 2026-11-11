import { useEffect, useRef, useState } from "react";

export const useRotation = (
  turning: boolean,
  duration: number,
  reverse: boolean
) => {
  const [rotation, setRotation] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    if (!turning) {
      return;
    }
    const from = current.current % 360;
    const started = Date.now();
    const interval = setInterval(() => {
      const travel = (((Date.now() - started) % duration) / duration) * 360;
      const next = from + travel * (reverse ? -1 : 1);
      current.current = next;
      setRotation(next);
    }, 16);
    return () => clearInterval(interval);
  }, [turning, duration, reverse]);
  return rotation;
};
