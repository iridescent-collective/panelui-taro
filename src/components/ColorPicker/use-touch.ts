import { useEffect, useRef, useState } from "react";

import type {
  ElementLayout,
  useElementLayout,
} from "../../hooks/use-element-layout";
import {
  readChangedTouchPoints,
  readTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";

interface Contact {
  point: TouchPoint;
  last: TouchPoint;
  active: boolean;
  time: number;
  frame: ElementLayout | null;
  ended: boolean;
}
export const useColorTouch = (
  enabled: boolean,
  track: boolean,
  scale: number,
  apply: (x: number, y: number, commit: boolean, frame: ElementLayout) => void,
  measure: ReturnType<typeof useElementLayout>["refresh"]
) => {
  const latest = useRef({ apply, enabled, scale });
  latest.current = { apply, enabled, scale };
  const contact = useRef<Contact | null>(null);
  const [active, setActive] = useState(false);
  const stop = () => {
    contact.current = null;
    setActive(false);
  };
  useEffect(() => {
    stop();
  }, [enabled, scale]);
  useEffect(
    () => () => {
      contact.current = null;
    },
    []
  );
  const emit = (point: TouchPoint, commit: boolean, layout: ElementLayout) => {
    const next = latest.current;
    next.apply(
      point.clientX * next.scale - layout.left,
      point.clientY * next.scale - layout.top,
      commit,
      layout
    );
  };
  const onTouchStart = (event: unknown) => {
    stop();
    if (!latest.current.enabled) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra) {
      return;
    }
    const owner: Contact = {
      active: !track,
      ended: false,
      frame: null,
      last: { ...point },
      point: { ...point },
      time: Date.now(),
    };
    contact.current = owner;
    setActive(!track);
    measure(
      () => contact.current === owner && latest.current.enabled,
      (layout) => {
        if (contact.current !== owner || !latest.current.enabled) {
          return;
        }
        if (!layout || layout.width <= 0 || layout.height <= 0) {
          stop();
          return;
        }
        owner.frame = layout;
        if (owner.ended) {
          stop();
          emit(owner.last, true, owner.frame);
        } else if (owner.active) {
          emit(owner.last, false, owner.frame);
        }
      }
    );
  };
  const move = (point: TouchPoint) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    if (!current.active) {
      const dx = (point.clientX - current.point.clientX) * latest.current.scale;
      const dy = (point.clientY - current.point.clientY) * latest.current.scale;
      if (Math.abs(dy) > 10 && Math.abs(dx) <= 6) {
        stop();
        return;
      }
      if (Math.abs(dx) <= 6) {
        return;
      }
      current.active = true;
      setActive(true);
    }
    current.last = { ...point };
    if (current.frame) {
      emit(point, false, current.frame);
    }
  };
  return {
    active,
    onTouchCancel: stop,
    onTouchEnd: (event: unknown) => {
      const { current } = contact;
      if (!current || current.ended) {
        return;
      }
      const [point, extra] = readChangedTouchPoints(event);
      if (extra || (point && point.identifier !== current.point.identifier)) {
        stop();
        return;
      }
      const final = point ?? current.last;
      const commit = current.active || Date.now() - current.time <= 250;
      if (!commit) {
        stop();
        return;
      }
      if (!current.frame) {
        current.last = { ...final };
        current.ended = true;
        setActive(false);
        return;
      }
      stop();
      emit(final, true, current.frame);
    },
    onTouchMove: (event: unknown) => {
      const { current } = contact;
      if (!current || current.ended) {
        return;
      }
      const [point, extra] = readTouchPoints(event);
      if (!point || extra || point.identifier !== current.point.identifier) {
        stop();
        return;
      }
      move(point);
    },
    onTouchStart,
  };
};
