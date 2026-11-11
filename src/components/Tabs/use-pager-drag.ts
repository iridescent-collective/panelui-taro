import { getWindowInfo, nextTick } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import type { useSpringNumber } from "../../hooks/use-spring-number";
import {
  readChangedTouchPoints,
  readTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { PAGER_SWIPE } from "./constants";

interface Drag {
  point: TouchPoint;
  origin: TouchPoint;
  scale: number;
  lastTime: number;
  lastMotionTime: number;
  velocity: number;
  from: number;
  active: boolean;
}
const bounded = (value: number, last: number) =>
  Math.max(0, Math.min(last, value));
export const pagerTarget = (
  from: number,
  position: number,
  velocity: number,
  count: number
) => {
  let target = from;
  if (Math.abs(velocity) > PAGER_SWIPE.velocity) {
    target += velocity > 0 ? 1 : -1;
  } else if (Math.abs(position - from) > PAGER_SWIPE.distanceRatio) {
    target += position > from ? 1 : -1;
  }
  return bounded(target, count - 1);
};
export const usePagerDrag = ({
  motion,
  active,
  width,
  count,
  sign,
  onSelect,
}: {
  motion: ReturnType<typeof useSpringNumber>;
  active: number;
  width: number;
  count: number;
  sign: number;
  onSelect: (index: number) => void;
}) => {
  const drag = useRef<Drag | null>(null);
  const mounted = useRef(true);
  const latest = useRef({ active, count, motion, onSelect, sign, width });
  latest.current = { active, count, motion, onSelect, sign, width };
  const cancel = () => {
    const { current } = drag;
    drag.current = null;
    if (current?.active) {
      latest.current.motion.springTo(latest.current.active);
    }
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      drag.current = null;
    };
  }, []);
  useEffect(() => {
    drag.current = null;
    motion.springTo(active);
  }, [active, width, count, motion.springTo]);
  const move = (current: Drag, point: TouchPoint) => {
    const now = Date.now();
    const elapsed = now - current.lastTime;
    if (elapsed > 0 && point.clientX !== current.point.clientX) {
      current.velocity =
        ((point.clientX - current.point.clientX) * current.scale * 1000) /
        elapsed;
      current.lastMotionTime = now;
    } else if (now - current.lastMotionTime > PAGER_SWIPE.recentMotionWindow) {
      current.velocity = 0;
    }
    current.lastTime = now;
    current.point = point;
    const dx = (point.clientX - current.origin.clientX) * current.scale;
    const dy = (point.clientY - current.origin.clientY) * current.scale;
    if (!current.active) {
      if (Math.abs(dy) > PAGER_SWIPE.verticalFailure) {
        cancel();
        return;
      }
      if (Math.abs(dx) <= PAGER_SWIPE.activation) {
        return;
      }
      current.active = true;
      current.from = Math.round(latest.current.motion.read());
    }
    const raw =
      current.from - (dx * latest.current.sign) / latest.current.width;
    const last = latest.current.count - 1;
    let position = raw;
    if (raw < 0) {
      position = raw * PAGER_SWIPE.endResistance;
    } else if (raw > last) {
      position = last + (raw - last) * PAGER_SWIPE.endResistance;
    }
    latest.current.motion.setImmediate(position);
  };
  const onTouchStart = (event: unknown) => {
    const [point, extra] = readTouchPoints(event);
    if (!point || extra || latest.current.width <= 0) {
      cancel();
      return;
    }
    drag.current = {
      active: false,
      from: active,
      lastMotionTime: Date.now(),
      lastTime: Date.now(),
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
    if (drag.current !== current || !current.active) {
      drag.current = null;
      return;
    }
    drag.current = null;
    const velocity = -current.velocity * latest.current.sign;
    const target = pagerTarget(
      current.from,
      latest.current.motion.read(),
      velocity,
      latest.current.count
    );
    latest.current.motion.springTo(target, velocity / latest.current.width);
    if (target !== latest.current.active) {
      latest.current.onSelect(target);
      nextTick(() => {
        if (
          mounted.current &&
          !drag.current &&
          latest.current.active !== target
        ) {
          latest.current.motion.springTo(latest.current.active);
        }
      });
    }
  };
  return { onTouchCancel: cancel, onTouchEnd, onTouchMove, onTouchStart };
};
