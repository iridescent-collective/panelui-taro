import { getWindowInfo } from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";

import { useSpringNumber } from "../../hooks/use-spring-number";
import { useTimingNumber } from "../../hooks/use-timing-number";
import {
  readTouchPoints,
  readChangedTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import type { ToastPlacement } from "./toast-store";

interface Contact {
  point: TouchPoint;
  last: TouchPoint;
  scale: number;
  time: number;
  active: boolean;
  velocity: number;
}
export const useToastSwipe = (
  placement: ToastPlacement,
  hide: () => void,
  reduced: boolean,
  disabled: boolean
) => {
  const motion = useSpringNumber(
    0,
    { damping: 20, mass: 0.6, stiffness: 260 },
    reduced,
    undefined,
    false
  );
  const [pressed, setPressed] = useState(false);
  const scale = useTimingNumber(pressed ? 0.995 : 1, 120, reduced);
  const contact = useRef<Contact | null>(null);
  const latest = useRef({ hide, motion });
  latest.current = { hide, motion };
  const dismissSign = placement === "top" ? -1 : 1;
  const decay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaving = useRef(false);
  const stopDecay = useCallback(() => {
    if (decay.current !== null) {
      clearTimeout(decay.current);
      decay.current = null;
    }
  }, []);
  const carryMomentum = (velocity: number) => {
    stopDecay();
    let speed = velocity * 1.5;
    let last = Date.now();
    const draw = () => {
      const now = Date.now();
      const elapsed = now - last;
      last = now;
      speed *= 0.998 ** (elapsed / (1000 / 60));
      const next = latest.current.motion.read() + (speed * elapsed) / 1000;
      latest.current.motion.setImmediate(
        dismissSign === 1 ? Math.max(0, next) : Math.min(0, next)
      );
      decay.current = setTimeout(draw, 16);
    };
    decay.current = setTimeout(draw, 16);
  };
  const [active, setActive] = useState(false);
  const cancel = () => {
    if (leaving.current) {
      return;
    }
    stopDecay();
    contact.current = null;
    setPressed(false);
    setActive(false);
    latest.current.motion.springTo(0);
  };
  useEffect(() => {
    cancel();
  }, [placement, disabled]);
  useEffect(
    () => () => {
      contact.current = null;
      stopDecay();
    },
    [stopDecay]
  );
  const onTouchStart = (event: unknown) => {
    if (disabled) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra) {
      cancel();
      return;
    }
    stopDecay();
    leaving.current = false;
    motion.setImmediate(motion.read());
    contact.current = {
      active: false,
      last: point,
      point,
      scale: 375 / getWindowInfo().windowWidth,
      time: Date.now(),
      velocity: 0,
    };
    setPressed(true);
  };
  const onTouchMove = (event: unknown) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra || point.identifier !== current.point.identifier) {
      cancel();
      return;
    }
    const x = (point.clientX - current.point.clientX) * current.scale;
    const y = (point.clientY - current.point.clientY) * current.scale;
    if (!current.active && Math.abs(x) > 16) {
      cancel();
      return;
    }
    if (!current.active && Math.abs(y) < 12) {
      return;
    }
    current.active = true;
    setActive(true);
    const change = (point.clientY - current.last.clientY) * current.scale;
    const elapsed = Date.now() - current.time;
    if (elapsed > 0) {
      current.velocity = (change / elapsed) * 1000;
    }
    current.time = Date.now();
    current.last = point;
    const next = latest.current.motion.read() + change;
    latest.current.motion.setImmediate(
      next * dismissSign > 0
        ? next
        : Math.min(Math.abs(next) / 400, 1) * 40 * -dismissSign
    );
  };
  const onTouchEnd = (event: unknown) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    const [point, extra] = readChangedTouchPoints(event);
    if (extra || (point && point.identifier !== current.point.identifier)) {
      cancel();
      return;
    }
    contact.current = null;
    setPressed(false);
    setActive(false);
    const offset = latest.current.motion.read();
    const velocity = Date.now() - current.time > 100 ? 0 : current.velocity;
    if (
      current.active &&
      offset * dismissSign > 0 &&
      (Math.abs(offset) > 50 || Math.abs(velocity) > 500)
    ) {
      leaving.current = true;
      if (!reduced) {
        carryMomentum(velocity);
      }
      latest.current.hide();
    } else {
      latest.current.motion.springTo(0);
    }
  };
  return {
    active,
    offset: motion.value,
    onTouchCancel: cancel,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
    scale,
  };
};
