import { useEffect, useRef, useState } from "react";

import {
  readChangedTouchPoints,
  readTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { DRAWER_DISMISS_DISTANCE, DRAWER_DISMISS_VELOCITY } from "./constants";

interface PanOptions {
  enabled: boolean;
  open: boolean;
  horizontal: boolean;
  outward: number;
  extent: number;
  scale: number;
  begin: () => number;
  update: (next: number) => void;
  restore: () => void;
  close: () => void;
}
interface Contact {
  origin: TouchPoint;
  last: TouchPoint;
  time: number;
  active: boolean;
  from: number;
  travel: number;
  velocity: number;
}
export const useDrawerPan = (options: PanOptions) => {
  const latest = useRef(options);
  latest.current = options;
  const contact = useRef<Contact | null>(null);
  const [active, setActive] = useState(false);
  const cancel = () => {
    if (!contact.current) {
      return;
    }
    contact.current = null;
    setActive(false);
    if (latest.current.open) {
      latest.current.restore();
    }
  };
  useEffect(() => {
    cancel();
  }, [
    options.open,
    options.enabled,
    options.horizontal,
    options.outward,
    options.extent,
    options.scale,
  ]);
  useEffect(
    () => () => {
      contact.current = null;
    },
    []
  );
  const onTouchStart = (event: unknown) => {
    cancel();
    const settings = latest.current;
    if (!settings.enabled || !settings.open) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra) {
      return;
    }
    const from = settings.begin();
    contact.current = {
      active: false,
      from,
      last: point,
      origin: point,
      time: Date.now(),
      travel: from,
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
    const main = settings.horizontal ? dx : dy;
    const cross = settings.horizontal ? dy : dx;
    if (!current.active && Math.abs(cross) > 18) {
      cancel();
      return;
    }
    if (!current.active && Math.abs(main) <= 12) {
      return;
    }
    current.active = true;
    setActive(true);
    const delta =
      (settings.horizontal
        ? point.clientX - current.last.clientX
        : point.clientY - current.last.clientY) *
      settings.scale *
      settings.outward;
    const next = current.travel + delta;
    current.travel = next > 0 ? next : next / 3;
    const elapsed = Date.now() - current.time;
    if (elapsed > 0) {
      current.velocity = (delta * 1000) / elapsed;
    }
    current.last = point;
    current.time = Date.now();
    settings.update(current.travel);
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
    contact.current = null;
    setActive(false);
    const settings = latest.current;
    const velocity = Date.now() - current.time > 100 ? 0 : current.velocity;
    if (
      current.active &&
      (current.travel > DRAWER_DISMISS_DISTANCE ||
        velocity > DRAWER_DISMISS_VELOCITY)
    ) {
      settings.close();
    }
    settings.restore();
  };
  return {
    active,
    onTouchCancel: cancel,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
  };
};
