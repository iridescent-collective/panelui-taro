import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import { selectionTick } from "../../lib/haptics";
import {
  readChangedTouchPoints,
  readTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import type { SplitViewContextValue } from "./context";
import { clamp, nearestSnapIndex } from "./split-view-math";

interface Drag {
  origin: TouchPoint;
  point: TouchPoint;
  from: number;
  scale: number;
  active: boolean;
  landed: number;
  time: number;
  motionTime: number;
  velocity: number;
}
export const useSplitDrag = (context: SplitViewContextValue) => {
  const latest = useRef(context);
  latest.current = context;
  const current = useRef<Drag | null>(null);
  const [active, setActive] = useState(false);
  const cancel = () => {
    if (!current.current) {
      return;
    }
    current.current = null;
    setActive(false);
    latest.current.cancel();
  };
  useEffect(() => {
    if (current.current) {
      cancel();
    }
  }, [
    context.room,
    context.points,
    context.minPx,
    context.maxPx,
    context.disabled,
    context.snapIndex,
  ]);
  useEffect(
    () => () => {
      current.current = null;
      context.dragging.value = false;
    },
    [context.dragging]
  );
  const move = (drag: Drag, point: TouchPoint) => {
    const owner = latest.current;
    const x = (point.clientX - drag.origin.clientX) * drag.scale;
    const y = (point.clientY - drag.origin.clientY) * drag.scale;
    if (!drag.active && Math.abs(x) > 16) {
      cancel();
      return false;
    }
    const now = Date.now();
    const elapsed = now - drag.time;
    if (point.clientY !== drag.point.clientY && elapsed > 0) {
      drag.velocity =
        ((point.clientY - drag.point.clientY) * drag.scale * 1000) / elapsed;
      drag.motionTime = now;
    } else if (now - drag.motionTime > 80) {
      drag.velocity = 0;
    }
    drag.time = now;
    drag.point = point;
    if (!drag.active && Math.abs(y) < 8) {
      return false;
    }
    drag.active = true;
    setActive(true);
    const height = clamp(drag.from + y, owner.minPx, owner.maxPx);
    owner.writeHeight(height);
    const index = nearestSnapIndex(height, owner.points, 0, owner.room);
    const tick = index !== drag.landed;
    drag.landed = index;
    return tick;
  };
  const onTouchStart = (event: unknown) => {
    const owner = latest.current;
    if (owner.disabled || owner.points.length === 0 || owner.room <= 0) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra) {
      cancel();
      return;
    }
    const from = owner.topHeight.value;
    owner.writeHeight(from);
    owner.dragging.value = true;
    const now = Date.now();
    current.current = {
      active: false,
      from,
      landed: -1,
      motionTime: now,
      origin: point,
      point,
      scale: 375 / getWindowInfo().windowWidth,
      time: now,
      velocity: 0,
    };
  };
  const onTouchMove = async (event: unknown) => {
    const drag = current.current;
    if (!drag) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra || point.identifier !== drag.origin.identifier) {
      cancel();
      return;
    }
    if (move(drag, point)) {
      await selectionTick();
    }
  };
  const onTouchEnd = (event: unknown) => {
    const drag = current.current;
    if (!drag) {
      return;
    }
    const [point, extra] = readChangedTouchPoints(event);
    if (extra || (point && point.identifier !== drag.origin.identifier)) {
      cancel();
      return;
    }
    current.current = null;
    setActive(false);
    const owner = latest.current;
    owner.dragging.value = false;
    const velocity = Date.now() - drag.motionTime > 80 ? 0 : drag.velocity;
    owner.snapTo(
      nearestSnapIndex(
        owner.topHeight.value,
        owner.points,
        velocity,
        owner.room
      )
    );
  };
  return {
    active,
    onTouchCancel: cancel,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
  };
};
