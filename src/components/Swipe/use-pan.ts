import { useEffect, useRef, useState } from "react";

import { selectionTick } from "../../lib/haptics";
import {
  readChangedTouchPoints,
  readTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { FULL_SWIPE_RATIO } from "./constants";
import { swipeOffset } from "./math";

interface SwipePanOptions {
  enabled: boolean;
  start: number;
  end: number;
  sign: number;
  scale: number;
  full: boolean;
  haptics: boolean;
  domain: string;
  begin: () => number;
  update: (value: number) => void;
  restore: () => void;
  finish: (offset: number, velocity: number) => void;
}
interface Contact {
  origin: TouchPoint;
  last: TouchPoint;
  from: number;
  time: number;
  velocity: number;
  active: boolean;
  armed: boolean;
  offset: number;
}
export const useSwipePan = (options: SwipePanOptions) => {
  const latest = useRef(options);
  latest.current = options;
  const contact = useRef<Contact | null>(null);
  const [active, setActive] = useState(false);
  const stop = () => {
    contact.current = null;
    setActive(false);
  };
  const cancel = () => {
    if (!contact.current) {
      return;
    }
    stop();
    latest.current.restore();
  };
  useEffect(() => {
    cancel();
  }, [
    options.enabled,
    options.start,
    options.end,
    options.sign,
    options.scale,
    options.domain,
    options.full,
  ]);
  useEffect(
    () => () => {
      contact.current = null;
    },
    []
  );
  const onTouchStart = (event: unknown) => {
    cancel();
    if (!latest.current.enabled) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra) {
      return;
    }
    const from = latest.current.begin();
    contact.current = {
      active: false,
      armed: false,
      from,
      last: point,
      offset: from,
      origin: point,
      time: Date.now(),
      velocity: 0,
    };
  };
  const move = (point: TouchPoint) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    const settings = latest.current;
    const dx = (point.clientX - current.origin.clientX) * settings.scale;
    const dy = (point.clientY - current.origin.clientY) * settings.scale;
    if (!current.active && Math.abs(dy) > 14) {
      cancel();
      return;
    }
    if (!current.active && Math.abs(dx) <= 12) {
      return;
    }
    current.active = true;
    setActive(true);
    const elapsed = Date.now() - current.time;
    if (elapsed > 0) {
      current.velocity =
        ((point.clientX - current.last.clientX) *
          settings.scale *
          settings.sign *
          1000) /
        elapsed;
    }
    current.last = point;
    current.time = Date.now();
    current.offset = swipeOffset(
      current.from + dx * settings.sign,
      settings.start,
      settings.end
    );
    settings.update(current.offset);
    const limit = current.offset > 0 ? settings.start : settings.end;
    const reached =
      settings.full &&
      limit > 0 &&
      Math.abs(current.offset) > limit * FULL_SWIPE_RATIO;
    if (reached !== current.armed) {
      current.armed = reached;
      if (reached && settings.haptics) {
        void selectionTick();
      }
    }
  };
  const onTouchMove = (event: unknown) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra || point.identifier !== current.origin.identifier) {
      cancel();
      return;
    }
    move(point);
  };
  const onTouchEnd = (event: unknown) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    const [point, extra] = readChangedTouchPoints(event);
    if (extra || (point && point.identifier !== current.origin.identifier)) {
      cancel();
      return;
    }
    if (
      point &&
      (point.clientX !== current.last.clientX ||
        point.clientY !== current.last.clientY)
    ) {
      move(point);
    }
    if (contact.current !== current) {
      return;
    }
    stop();
    if (current.active) {
      latest.current.finish(
        current.offset,
        Date.now() - current.time > 100 ? 0 : current.velocity
      );
    } else {
      latest.current.restore();
    }
  };
  return {
    active,
    onTouchCancel: cancel,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
    stop,
  };
};
