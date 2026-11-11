import { useEffect, useRef, useState } from "react";

import type { LoaderVariant } from "./types";

export const useLoaderClock = (
  animate: boolean,
  speed: number,
  variant: LoaderVariant,
  scale: number
) => {
  const [time, setTime] = useState(0);
  const physics = useRef(0);
  const latest = useRef(speed);
  latest.current = speed;
  const isPhysics = variant === "wave-physics";
  const travelScale =
    variant === "bounce-dots" ||
    variant === "bar-cascade" ||
    variant === "symmetric-wave"
      ? scale
      : 1;
  useEffect(() => {
    if (!isPhysics) {
      physics.current = 0;
    }
  }, [isPhysics]);
  useEffect(() => {
    if (isPhysics) {
      return;
    }
    setTime(0);
    if (!animate) {
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => setTime((Date.now() - start) * speed), 16);
    return () => clearInterval(timer);
  }, [animate, speed, variant, travelScale, isPhysics]);
  useEffect(() => {
    if (!animate || !isPhysics) {
      return;
    }
    let previous = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      physics.current +=
        (Math.min(now - previous, 48) / 1000) * latest.current * 0.35;
      previous = now;
      setTime(physics.current);
    }, 16);
    return () => clearInterval(timer);
  }, [animate, isPhysics]);
  return isPhysics ? physics.current : time;
};
