import { useEffect, useRef, useState } from "react";

import {
  readChangedTouchPoints,
  readTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { lever, releasedDirection, resist } from "./geometry";
import type { useStackModel } from "./use-model";

interface Contact {
  origin: TouchPoint;
  last: TouchPoint;
  time: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
  active: boolean;
}
export const useStackPan = (
  model: ReturnType<typeof useStackModel>,
  scale: number,
  top: number,
  enabled: boolean
) => {
  const contact = useRef<Contact | null>(null);
  const [active, setActive] = useState(false);
  const latest = useRef({ enabled, model, scale, top });
  latest.current = { enabled, model, scale, top };
  const stop = () => {
    contact.current = null;
    setActive(false);
  };
  const cancel = () => {
    if (!contact.current) {
      return;
    }
    stop();
    latest.current.model.restore();
  };
  model.stopContact.current = stop;
  useEffect(() => {
    cancel();
  }, [enabled, scale, top, model.domain]);
  const move = (point: TouchPoint) => {
    const c = contact.current;
    if (!c) {
      return;
    }
    const { model: m, scale: ratio } = latest.current;
    const dx = (point.clientX - c.origin.clientX) * ratio;
    const dy = (point.clientY - c.origin.clientY) * ratio;
    const sideways = m.allowed.includes("left") || m.allowed.includes("right");
    const upright = m.allowed.includes("up") || m.allowed.includes("down");
    if (!c.active) {
      if (sideways && !upright && Math.abs(dx) <= 10) {
        return;
      }
      if (upright && !sideways && Math.abs(dy) <= 10) {
        return;
      }
      c.active = true;
      c.x -= dx;
      c.y -= dy;
      setActive(true);
    }
    const elapsed = Date.now() - c.time;
    if (elapsed > 0) {
      c.vx = ((point.clientX - c.last.clientX) * ratio * 1000) / elapsed;
      c.vy = ((point.clientY - c.last.clientY) * ratio * 1000) / elapsed;
    }
    c.last = point;
    c.time = Date.now();
    m.publish({
      x: sideways ? c.x + dx : resist(c.x + dx, m.signal.value.width, 0.18),
      y: upright ? c.y + dy : resist(c.y + dy, m.signal.value.height, 0.18),
    });
  };
  return {
    active,
    onTouchCancel: cancel,
    onTouchEnd: (event: unknown) => {
      const c = contact.current;
      if (!c) {
        return;
      }
      const [point, extra] = readChangedTouchPoints(event);
      if (extra || (point && point.identifier !== c.origin.identifier)) {
        cancel();
        return;
      }
      if (
        point &&
        (point.clientX !== c.last.clientX || point.clientY !== c.last.clientY)
      ) {
        move(point);
      }
      if (contact.current !== c) {
        return;
      }
      stop();
      const m = latest.current.model;
      if (!c.active) {
        m.restore();
        return;
      }
      const stale = Date.now() - c.time > 100;
      const vx = stale ? 0 : c.vx;
      const vy = stale ? 0 : c.vy;
      const frame = m.signal.value;
      const direction = releasedDirection(
        m.allowed,
        frame.x,
        frame.y,
        vx,
        vy,
        frame.width,
        frame.height,
        m.context.threshold
      );
      if (direction) {
        m.launch(direction, vx, vy);
      } else {
        m.restore(vx, vy);
      }
    },
    onTouchMove: (event: unknown) => {
      const c = contact.current;
      if (!c) {
        return;
      }
      const [point, extra] = readTouchPoints(event);
      if (!point || extra || point.identifier !== c.origin.identifier) {
        cancel();
        return;
      }
      move(point);
    },
    onTouchStart: (event: unknown) => {
      cancel();
      const { model: m, scale: ratio, top: offset } = latest.current;
      if (!latest.current.enabled || m.leaving.current) {
        return;
      }
      const [point, extra] = readTouchPoints(event);
      if (!point || extra) {
        return;
      }
      const frame = m.begin(
        lever(point.clientY * ratio - offset, m.signal.value.height)
      );
      contact.current = {
        active: false,
        last: point,
        origin: point,
        time: Date.now(),
        vx: 0,
        vy: 0,
        x: frame.x,
        y: frame.y,
      };
    },
  };
};
