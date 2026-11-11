import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import {
  readTouchPoints,
  readChangedTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";

interface OwnedPanOptions {
  enabled: boolean;
  domain: string;
  zoom: number;
  begin: () => void;
  update: (x: number, y: number) => void;
  finish: () => void;
  cancel?: () => void;
  tap?: () => void;
}
const stopEvent = (event: unknown) => {
  if (
    event &&
    typeof event === "object" &&
    "stopPropagation" in event &&
    typeof event.stopPropagation === "function"
  ) {
    event.stopPropagation();
  }
};
export const useOwnedPan = (options: OwnedPanOptions) => {
  const latest = useRef(options);
  latest.current = options;
  const contact = useRef<{
    origin: TouchPoint;
    last: TouchPoint;
    active: boolean;
  } | null>(null);
  const [active, setActive] = useState(false);
  const reset = () => {
    if (contact.current) {
      latest.current.cancel?.();
    }
    contact.current = null;
    setActive(false);
  };
  useEffect(reset, [options.enabled, options.domain]);
  useEffect(
    () => () => {
      if (contact.current) {
        latest.current.cancel?.();
      }
      contact.current = null;
    },
    []
  );
  const move = (point: TouchPoint) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    const config = latest.current;
    const scale = 375 / getWindowInfo().windowWidth;
    const dx = (point.clientX - current.origin.clientX) * scale;
    const dy = (point.clientY - current.origin.clientY) * scale;
    current.last = point;
    if (!current.active && Math.hypot(dx, dy) < 4) {
      return;
    }
    if (!config.enabled) {
      reset();
      return;
    }
    current.active = true;
    setActive(true);
    config.update(dx / config.zoom, dy / config.zoom);
  };
  return {
    active,
    cancel: reset,
    onTouchCancel: (event: unknown) => {
      if (contact.current) {
        stopEvent(event);
      }
      reset();
    },
    onTouchEnd: (event: unknown) => {
      const { current } = contact;
      if (!current) {
        return;
      }
      stopEvent(event);
      const point = readChangedTouchPoints(event).find(
        (next) => next.identifier === current.origin.identifier
      );
      if (point) {
        move(point);
      }
      if (!contact.current) {
        return;
      }
      contact.current = null;
      setActive(false);
      if (current.active) {
        latest.current.finish();
      } else {
        latest.current.tap?.();
      }
    },
    onTouchMove: (event: unknown) => {
      const { current } = contact;
      if (!current) {
        return;
      }
      const [point, extra] = readTouchPoints(event);
      if (!point || extra || point.identifier !== current.origin.identifier) {
        reset();
        return;
      }
      stopEvent(event);
      move(point);
    },
    onTouchStart: (event: unknown) => {
      reset();
      const config = latest.current;
      const [point, extra] = readTouchPoints(event);
      if (!point || extra || (!config.enabled && !config.tap)) {
        return;
      }
      stopEvent(event);
      contact.current = { active: false, last: point, origin: point };
      config.begin();
    },
  };
};
