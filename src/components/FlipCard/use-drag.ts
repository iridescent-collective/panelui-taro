import { getWindowInfo, nextTick } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import type { useSpringNumber } from "../../hooks/use-spring-number";
import {
  readChangedTouchPoints,
  readTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import {
  DRAG_SPAN,
  FLICK_VELOCITY,
  MIN_DRAG_DISTANCE,
  MOTION_WINDOW,
} from "./constants";
import type { FlipCardDirection, FlipCardTrigger } from "./types";

interface Drag {
  point: TouchPoint;
  origin: TouchPoint;
  from: number;
  scale: number;
  active: boolean;
  lastTime: number;
  lastMotion: number;
  velocity: number;
}
interface DragOptions {
  flipped: boolean;
  direction: FlipCardDirection;
  trigger: FlipCardTrigger;
  span: number;
  motion: ReturnType<typeof useSpringNumber>;
  settle: (flipped: boolean) => void;
}
export const useFlipDrag = (options: DragOptions) => {
  const drag = useRef<Drag | null>(null);
  const latest = useRef(options);
  latest.current = options;
  const release = useRef(0);
  const mounted = useRef(true);
  const suppressClick = useRef(false);
  const cancel = () => {
    drag.current = null;
    latest.current.motion.springTo(latest.current.flipped ? 1 : 0);
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      drag.current = null;
    };
  }, []);
  useEffect(() => {
    if (drag.current?.active) {
      suppressClick.current = true;
    }
    drag.current = null;
    latest.current.motion.springTo(latest.current.flipped ? 1 : 0);
  }, [options.direction, options.trigger]);
  const move = (current: Drag, point: TouchPoint) => {
    const horizontal = latest.current.direction === "horizontal";
    const coordinate = horizontal ? point.clientX : point.clientY;
    const previous = horizontal ? current.point.clientX : current.point.clientY;
    const origin = horizontal ? current.origin.clientX : current.origin.clientY;
    const now = Date.now();
    const elapsed = now - current.lastTime;
    if (elapsed > 0 && coordinate !== previous) {
      current.velocity =
        ((coordinate - previous) * current.scale * 1000) / elapsed;
      current.lastMotion = now;
    } else if (now - current.lastMotion > MOTION_WINDOW) {
      current.velocity = 0;
    }
    current.lastTime = now;
    current.point = point;
    const travel = (coordinate - origin) * current.scale;
    if (!current.active && Math.abs(travel) < MIN_DRAG_DISTANCE) {
      return;
    }
    current.active = true;
    const progress =
      current.from + travel / Math.max(latest.current.span * DRAG_SPAN, 1);
    latest.current.motion.setImmediate(Math.min(Math.max(progress, 0), 1));
  };
  const onTouchStart = (event: unknown) => {
    suppressClick.current = false;
    release.current += 1;
    if (latest.current.trigger !== "drag") {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra || latest.current.span <= 0) {
      cancel();
      return;
    }
    const now = Date.now();
    drag.current = {
      active: false,
      from: latest.current.motion.read(),
      lastMotion: now,
      lastTime: now,
      origin: point,
      point,
      scale: 375 / getWindowInfo().windowWidth,
      velocity: 0,
    };
  };
  const onTouchMove = (event: unknown) => {
    const { current } = drag;
    if (!current) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra || point.identifier !== current.point.identifier) {
      suppressClick.current = current.active;
      cancel();
      return;
    }
    move(current, point);
  };
  const onTouchEnd = (event: unknown) => {
    const { current } = drag;
    if (!current) {
      return;
    }
    const [point, extra] = readChangedTouchPoints(event);
    if (extra || (point && point.identifier !== current.point.identifier)) {
      cancel();
      return;
    }
    if (point) {
      move(current, point);
    }
    drag.current = null;
    if (!current.active) {
      return;
    }
    suppressClick.current = true;
    const position = latest.current.motion.read();
    const committed =
      position > 0.5 || (position > 0.1 && current.velocity > FLICK_VELOCITY);
    latest.current.settle(committed);
    release.current += 1;
    const request = release.current;
    nextTick(() => {
      if (mounted.current && release.current === request && !drag.current) {
        latest.current.motion.springTo(latest.current.flipped ? 1 : 0);
      }
    });
  };
  return {
    onTouchCancel: cancel,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
    shouldSuppressClick: () => {
      const suppress = suppressClick.current;
      suppressClick.current = false;
      return suppress;
    },
  };
};
