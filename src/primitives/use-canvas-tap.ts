import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import { readCanvasPoints } from "./canvas-touch";

const TAP_SLOP = 12;
interface CanvasTapContact<T> {
  identifier: number;
  x: number;
  y: number;
  scale: number;
  target: T;
}
const releasePointValid = <T>(event: unknown, value: CanvasTapContact<T>) => {
  if (!event || typeof event !== "object") {
    return true;
  }
  if (
    "touches" in event &&
    Array.isArray(event.touches) &&
    event.touches.length > 0
  ) {
    return false;
  }
  if (
    "changedTouches" in event &&
    Array.isArray(event.changedTouches) &&
    event.changedTouches.length > 0
  ) {
    const [point, extra] = readCanvasPoints({ touches: event.changedTouches });
    return Boolean(
      point &&
      !extra &&
      point.identifier === value.identifier &&
      Math.abs(point.x - value.x) * value.scale <= TAP_SLOP &&
      Math.abs(point.y - value.y) * value.scale <= TAP_SLOP
    );
  }
  return true;
};
export const useCanvasTap = <T>(
  resolveTarget: (x: number, y: number) => T | null,
  commit: (target: T) => void,
  resetKey: unknown
) => {
  const latest = useRef({ commit, resolveTarget });
  latest.current = { commit, resolveTarget };
  const contact = useRef<CanvasTapContact<T> | null>(null);
  const cancel = () => {
    contact.current = null;
  };
  useEffect(cancel, [resetKey]);
  useEffect(() => cancel, []);
  const start = (event: unknown) => {
    cancel();
    const [point, extra] = readCanvasPoints(event);
    if (!point || extra) {
      return;
    }
    const scale = 375 / getWindowInfo().windowWidth;
    const target = latest.current.resolveTarget(
      point.x * scale,
      point.y * scale
    );
    if (target === null) {
      return;
    }
    contact.current = {
      identifier: point.identifier,
      scale,
      target,
      x: point.x,
      y: point.y,
    };
  };
  const move = (event: unknown) => {
    const value = contact.current;
    if (!value) {
      return;
    }
    const [point, extra] = readCanvasPoints(event);
    if (
      !point ||
      extra ||
      point.identifier !== value.identifier ||
      Math.abs(point.x - value.x) * value.scale > TAP_SLOP ||
      Math.abs(point.y - value.y) * value.scale > TAP_SLOP
    ) {
      cancel();
    }
  };
  const end = (event: unknown) => {
    const value = contact.current;
    cancel();
    if (value && releasePointValid(event, value)) {
      latest.current.commit(value.target);
    }
  };
  return {
    onTouchCancel: cancel,
    onTouchEnd: end,
    onTouchMove: move,
    onTouchStart: start,
  };
};
