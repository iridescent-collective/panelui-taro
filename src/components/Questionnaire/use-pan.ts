import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import {
  readTouchPoints,
  readChangedTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { SWIPE_FRACTION } from "./constants";

export const questionnaireDrag = (
  x: number,
  forward: boolean,
  back: boolean
) => ((x < 0 && !forward) || (x >= 0 && !back) ? x * 0.2 : x);
export const questionnaireRelease = (
  x: number,
  width: number,
  forward: boolean,
  back: boolean
) => {
  if (x < -width * SWIPE_FRACTION && forward) {
    return 1;
  }
  if (x > width * SWIPE_FRACTION && back) {
    return -1;
  }
  return 0;
};
interface PanOptions {
  name: string | null;
  enabled: boolean;
  width: number;
  forward: boolean;
  back: boolean;
  update: (value: number) => void;
  release: () => void;
  navigate: (delta: 1 | -1) => void;
}
export const useQuestionnairePan = (options: PanOptions) => {
  const current = useRef<{
    origin: TouchPoint;
    last: TouchPoint;
    active: boolean;
    translation: number;
  } | null>(null);
  const latest = useRef(options);
  latest.current = options;
  const [active, setActive] = useState(false);
  const cancel = () => {
    current.current = null;
    setActive(false);
    latest.current.release();
  };
  useEffect(cancel, [options.name, options.enabled, options.width]);
  useEffect(
    () => () => {
      current.current = null;
    },
    []
  );
  const move = (point: TouchPoint) => {
    const contact = current.current;
    if (!contact) {
      return;
    }
    const scale = 375 / getWindowInfo().windowWidth;
    const dx = (point.clientX - contact.origin.clientX) * scale;
    const dy = (point.clientY - contact.origin.clientY) * scale;
    if (!contact.active && Math.abs(dy) > 8) {
      cancel();
      return;
    }
    contact.last = point;
    contact.translation = dx;
    if (!contact.active && Math.abs(dx) <= 12) {
      return;
    }
    contact.active = true;
    setActive(true);
    latest.current.update(
      questionnaireDrag(dx, latest.current.forward, latest.current.back)
    );
  };
  return {
    active,
    onTouchCancel: cancel,
    onTouchEnd: (event: unknown) => {
      const contact = current.current;
      if (!contact) {
        return;
      }
      const points = readChangedTouchPoints(event);
      const point = points.find(
        (p) => p.identifier === contact.origin.identifier
      );
      if (point) {
        move(point);
      }
      if (!current.current) {
        return;
      }
      current.current = null;
      setActive(false);
      if (contact.active) {
        const direction = questionnaireRelease(
          contact.translation,
          latest.current.width,
          latest.current.forward,
          latest.current.back
        );
        if (direction) {
          latest.current.navigate(direction);
        }
      }
      latest.current.release();
    },
    onTouchMove: (event: unknown) => {
      const contact = current.current;
      if (!contact) {
        return;
      }
      const [point, extra] = readTouchPoints(event);
      if (!point || extra || point.identifier !== contact.origin.identifier) {
        cancel();
        return;
      }
      move(point);
    },
    onTouchStart: (event: unknown) => {
      cancel();
      if (!latest.current.enabled) {
        return;
      }
      const [point, extra] = readTouchPoints(event);
      if (point && !extra) {
        current.current = {
          active: false,
          last: point,
          origin: point,
          translation: 0,
        };
      }
    },
  };
};
