import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import { selectionTick } from "../../lib/haptics";
import {
  readChangedTouchPoints,
  readTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import type { SplitterContextValue } from "./context";
import { isCollapsed, resizeLayout } from "./splitter-math";

interface Drag {
  origin: TouchPoint;
  start: number[];
  active: boolean;
  scale: number;
  collapsed: boolean;
}
export const useSplitterDrag = (
  context: SplitterContextValue,
  boundary: number,
  frozen: boolean
) => {
  const [active, setActive] = useState(false);
  const current = useRef<Drag | null>(null);
  const latest = useRef({ boundary, context, frozen });
  latest.current = { boundary, context, frozen };
  const suppress = useRef(false);
  const cancel = () => {
    if (!current.current) {
      return;
    }
    if (current.current?.active) {
      suppress.current = true;
    }
    current.current = null;
    setActive(false);
    latest.current.context.update(latest.current.context.settled);
  };
  useEffect(() => {
    if (current.current) {
      cancel();
    }
  }, [
    context.orientation,
    context.sign,
    context.available,
    context.initial,
    context.settled,
    context.constraints,
    frozen,
    boundary,
  ]);
  useEffect(
    () => () => {
      current.current = null;
    },
    []
  );
  const move = (drag: Drag, point: TouchPoint) => {
    const { context: owner, boundary: seam } = latest.current;
    const horizontal = owner.orientation === "horizontal";
    const x = (point.clientX - drag.origin.clientX) * drag.scale;
    const y = (point.clientY - drag.origin.clientY) * drag.scale;
    const travel = horizontal ? x * owner.sign : y;
    const cross = horizontal ? y : x;
    if (!drag.active && Math.abs(cross) > 16) {
      cancel();
      return false;
    }
    if (!drag.active && Math.abs(travel) < 8) {
      if (Math.hypot(x, y) > 12) {
        suppress.current = true;
      }
      return false;
    }
    drag.active = true;
    setActive(true);
    const next = resizeLayout(
      drag.start,
      seam,
      (travel / owner.available) * 100,
      owner.constraints
    );
    owner.update(next);
    const constraint = owner.constraints[seam];
    const collapsed = constraint
      ? isCollapsed(next[seam] ?? 0, constraint)
      : false;
    const tick = collapsed !== drag.collapsed;
    drag.collapsed = collapsed;
    return tick;
  };
  const onTouchStart = (event: unknown) => {
    suppress.current = false;
    const { context: owner, boundary: seam, frozen: blocked } = latest.current;
    if (
      blocked ||
      seam < 0 ||
      seam + 1 >= owner.constraints.length ||
      owner.available <= 0
    ) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra) {
      cancel();
      return;
    }
    const start = [...owner.read()];
    const constraint = owner.constraints[seam];
    current.current = {
      active: false,
      collapsed: constraint ? isCollapsed(start[seam] ?? 0, constraint) : false,
      origin: point,
      scale: 375 / getWindowInfo().windowWidth,
      start,
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
    if (drag.active) {
      suppress.current = true;
      latest.current.context.commit([...latest.current.context.read()]);
    }
  };
  return {
    active,
    consumeClick: () => {
      const blocked = suppress.current;
      suppress.current = false;
      return blocked;
    },
    onTouchCancel: cancel,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
    suppressClick: () => {
      suppress.current = true;
    },
  };
};
