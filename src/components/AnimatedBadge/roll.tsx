import { View } from "@tarojs/components";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useSpringNumber } from "../../hooks/use-spring-number";
import { ROLL_IN, ROLL_OUT } from "./constants";
import type { RollProps } from "./types";

export const Roll = ({
  contentKey,
  children,
  reducedMotion,
  turn = false,
}: RollProps) => {
  const [shownKey, setShownKey] = useState(contentKey);
  const settled = Object.is(shownKey, contentKey);
  const outgoing = useRef<ReactNode>(children);
  const incomingKey = useRef(contentKey);
  const {
    value: phase,
    read,
    setImmediate,
    springTo,
  } = useSpringNumber(0, ROLL_IN, reducedMotion);
  useEffect(() => {
    incomingKey.current = contentKey;
    if (settled) {
      outgoing.current = children;
    }
  });
  useEffect(() => {
    if (reducedMotion) {
      setImmediate(0);
      setShownKey(incomingKey.current);
      return;
    }
    if (settled) {
      if (read() !== 0) {
        springTo(0);
      }
      return;
    }
    const from = read();
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    const frame = () => {
      const elapsed = Math.min((Date.now() - started) / ROLL_OUT, 1);
      const easing =
        elapsed < 0.5 ? 2 * elapsed * elapsed : 1 - (-2 * elapsed + 2) ** 2 / 2;
      setImmediate(from + (1 - from) * easing);
      if (elapsed >= 1) {
        setShownKey(incomingKey.current);
        setImmediate(-1);
        springTo(0);
      } else {
        timer = setTimeout(
          frame,
          Math.min(16, ROLL_OUT - (Date.now() - started))
        );
      }
    };
    timer = setTimeout(frame, 16);
    return () => clearTimeout(timer);
  }, [contentKey, settled, reducedMotion, read, setImmediate, springTo]);
  const distance = Math.min(Math.abs(phase), 1);
  return (
    <View
      className="flex items-center justify-center"
      style={{
        opacity: 1 - distance * 0.9,
        transform: `translateY(${-phase * 90}%) scale(${1 - distance * 0.1}) rotate(${turn ? phase * 12 : 0}deg)`,
      }}
    >
      {settled ? children : outgoing.current}
    </View>
  );
};
