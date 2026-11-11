import { useEffect, useRef, useState } from "react";

import {
  readChangedTouchPoints,
  readTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import type { useSortableModel } from "./use-model";

export const useSortableTouch = (
  id: string,
  root: ReturnType<typeof useSortableModel>,
  locked: boolean
) => {
  const latest = useRef({ id, locked, root });
  latest.current = { id, locked, root };
  const point = useRef<TouchPoint | null>(null);
  const held = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(false);
  const stop = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    timer.current = null;
    point.current = null;
    held.current = false;
    setActive(false);
  };
  const finalize = () => {
    if (held.current) {
      latest.current.root.finalize(latest.current.id);
    }
    stop();
  };
  useEffect(() => {
    finalize();
  }, [locked, id, root.activation, root.longPressDelay]);
  useEffect(
    () => () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    },
    []
  );
  const start = (p: TouchPoint) => {
    if (latest.current.locked) {
      return;
    }
    held.current = latest.current.root.begin(id, p.clientY * root.scale);
    setActive(held.current);
  };
  const move = (p: TouchPoint) => {
    const from = point.current;
    if (!from) {
      return;
    }
    const dx = (p.clientX - from.clientX) * root.scale;
    const dy = (p.clientY - from.clientY) * root.scale;
    if (!held.current) {
      if (root.activation === "longPress") {
        if (Math.hypot(dx, dy) > 10) {
          stop();
        }
        return;
      }
      if (Math.abs(dy) <= 10) {
        return;
      }
      start(p);
    }
    if (held.current) {
      root.update(id, dy, p.clientY * root.scale);
    }
  };
  return {
    active,
    onTouchCancel: finalize,
    onTouchEnd: (event: unknown) => {
      const [p, extra] = readChangedTouchPoints(event);
      if (extra || (p && p.identifier !== point.current?.identifier)) {
        finalize();
        return;
      }
      if (p) {
        move(p);
      }
      finalize();
    },
    onTouchMove: (event: unknown) => {
      const [p, extra] = readTouchPoints(event);
      if (!p || extra || p.identifier !== point.current?.identifier) {
        finalize();
        return;
      }
      move(p);
    },
    onTouchStart: (event: unknown) => {
      finalize();
      if (locked) {
        return;
      }
      const [p, extra] = readTouchPoints(event);
      if (!p || extra) {
        return;
      }
      point.current = p;
      if (root.activation === "longPress") {
        timer.current = setTimeout(() => {
          timer.current = null;
          if (point.current) {
            start(point.current);
          }
        }, root.longPressDelay);
      }
    },
  };
};
