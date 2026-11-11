import { getWindowInfo } from "@tarojs/taro";
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
import type { HoldState } from "./use-hold";

interface Contact {
  identifier: number;
  inside: boolean;
  scale: number;
  box: ElementLayout | null;
  point: TouchPoint | null;
}
export const useHoldGesture = (
  hold: HoldState,
  layout: ElementLayout | null,
  disabled: boolean,
  reduced: boolean,
  hitSlop?: { top?: number; bottom?: number; left?: number; right?: number },
  measure?: ReturnType<typeof useElementLayout>["refresh"]
) => {
  const contact = useRef<Contact | null>(null);
  const latest = useRef({ hitSlop, hold, layout });
  latest.current = { hitSlop, hold, layout };
  const [active, setActive] = useState(false);
  const cancel = () => {
    if (!contact.current) {
      return;
    }
    contact.current = null;
    setActive(false);
    latest.current.hold.abandon();
  };
  useEffect(() => {
    cancel();
  }, [disabled, reduced, hold.duration]);
  useEffect(
    () => () => {
      contact.current = null;
    },
    []
  );
  const checkPosition = (current: Contact, point: TouchPoint) => {
    const { box } = current;
    if (!box) {
      return;
    }
    const x = point.clientX * current.scale;
    const y = point.clientY * current.scale;
    const edges = latest.current.hitSlop;
    const inside =
      x >= box.left - (edges?.left ?? 0) - 16 &&
      x <= box.left + box.width + (edges?.right ?? 0) + 16 &&
      y >= box.top - (edges?.top ?? 0) - 16 &&
      y <= box.top + box.height + (edges?.bottom ?? 0) + 16;
    if (inside === current.inside) {
      return;
    }
    current.inside = inside;
    if (inside) {
      current.inside = latest.current.hold.begin();
    } else {
      latest.current.hold.abandon();
    }
    setActive(current.inside);
  };
  const onTouchStart = (event: unknown) => {
    const [point, extra] = readTouchPoints(event);
    if (!point || extra) {
      cancel();
      return;
    }
    cancel();
    const owner: Contact = {
      box: measure ? null : latest.current.layout,
      identifier: point.identifier,
      inside: false,
      point: null,
      scale: 375 / getWindowInfo().windowWidth,
    };
    contact.current = owner;
    const begin = () => {
      if (owner.point) {
        checkPosition(owner, owner.point);
      } else {
        owner.inside = latest.current.hold.begin();
        setActive(owner.inside);
      }
    };
    if (!measure) {
      begin();
      return;
    }
    measure(
      () => contact.current === owner,
      (box) => {
        if (contact.current !== owner) {
          return;
        }
        if (!box) {
          cancel();
          return;
        }
        owner.box = box;
        begin();
      }
    );
  };
  const onTouchMove = (event: unknown) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra || point.identifier !== current.identifier) {
      cancel();
      return;
    }
    current.point = point;
    checkPosition(current, point);
  };
  const onTouchEnd = (event: unknown) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    const [point, extra] = readChangedTouchPoints(event);
    if (extra || (point && point.identifier !== current.identifier)) {
      cancel();
      return;
    }
    cancel();
  };
  return {
    active,
    onTouchCancel: cancel,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
  };
};
