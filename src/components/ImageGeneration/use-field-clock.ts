import { useEffect, useRef, useState } from "react";

import { FRAME_INTERVAL, MAX_FRAME_DELTA, STILL_FRAME } from "./constants";

export const useFieldClock = (running: boolean) => {
  const [clock, setClock] = useState(STILL_FRAME);
  const time = useRef(STILL_FRAME);
  useEffect(() => {
    if (!running) {
      return;
    }
    let previous = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      time.current += Math.min(Math.max(0, now - previous), MAX_FRAME_DELTA);
      previous = now;
      setClock(time.current);
    }, FRAME_INTERVAL);
    return () => clearInterval(interval);
  }, [running]);
  return clock;
};
