import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import { readTouchPoints } from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { CONTEXT_MENU_DELAY, CONTEXT_MENU_SLOP } from "./constants";

interface HoldOptions {
  disabled: boolean;
  delay: number;
  slop: number;
  openAt: (point: { x: number; y: number }) => void;
  press: () => void;
}
export const useContextHold = (options: HoldOptions) => {
  const latest = useRef(options);
  latest.current = options;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contact = useRef<TouchPoint | null>(null);
  const suppressTap = useRef(false);
  const scale = useRef(1);
  const clear = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    timer.current = null;
    contact.current = null;
  };
  const cancel = () => {
    suppressTap.current = true;
    clear();
  };
  useEffect(() => {
    const hadContact = contact.current !== null;
    clear();
    if (options.disabled || hadContact) {
      suppressTap.current = true;
    }
  }, [options.disabled, options.delay, options.slop]);
  useEffect(() => clear, []);
  const onTouchStart = (event: unknown) => {
    clear();
    suppressTap.current = false;
    const [point, extra] = readTouchPoints(event);
    if (latest.current.disabled || !point || extra) {
      cancel();
      return;
    }
    contact.current = point;
    scale.current = 375 / getWindowInfo().windowWidth;
    const delay = Number.isFinite(latest.current.delay)
      ? Math.max(0, latest.current.delay)
      : CONTEXT_MENU_DELAY;
    timer.current = setTimeout(() => {
      timer.current = null;
      if (!contact.current || latest.current.disabled) {
        return;
      }
      suppressTap.current = true;
      latest.current.openAt({
        x: point.clientX * scale.current,
        y: point.clientY * scale.current,
      });
    }, delay);
  };
  const onTouchMove = (event: unknown) => {
    if (!contact.current) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    const slop = Number.isFinite(latest.current.slop)
      ? Math.max(0, latest.current.slop)
      : CONTEXT_MENU_SLOP;
    if (
      !point ||
      extra ||
      point.identifier !== contact.current.identifier ||
      Math.hypot(
        point.clientX - contact.current.clientX,
        point.clientY - contact.current.clientY
      ) *
        scale.current >
        slop
    ) {
      cancel();
    }
  };
  const onClick = () => {
    if (latest.current.disabled || suppressTap.current) {
      return false;
    }
    latest.current.press();
    return true;
  };
  return {
    onClick,
    onTouchCancel: cancel,
    onTouchEnd: clear,
    onTouchMove,
    onTouchStart,
  };
};
