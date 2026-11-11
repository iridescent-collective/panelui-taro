import { getWindowInfo, nextTick } from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import type { ElementLayout } from "../../hooks/use-element-layout";
import { selectionTick } from "../../lib/haptics";
import {
  readChangedTouchPoints,
  readTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { ratingFromPosition } from "./inputs";

interface RatingGesture {
  point: TouchPoint;
  startX: number;
  startValue: number;
  lastValue: number;
  moved: boolean;
  ended: boolean;
  layout?: ElementLayout;
}
export const useRatingGesture = ({
  value,
  max,
  precision,
  interactive,
  allowClear,
  haptics,
  onChange,
  onCommit,
}: {
  value: number;
  max: number;
  precision: number;
  interactive: boolean;
  allowClear: boolean;
  haptics: boolean;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
}) => {
  const measured = useElementLayout(true, max);
  const [display, setDisplay] = useState(value);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<RatingGesture | null>(null);
  const mounted = useRef(true);
  const latest = useRef({
    allowClear,
    haptics,
    interactive,
    max,
    onChange,
    onCommit,
    precision,
    value,
  });
  latest.current = {
    allowClear,
    haptics,
    interactive,
    max,
    onChange,
    onCommit,
    precision,
    value,
  };
  const apply = (current: RatingGesture, commit: boolean) => {
    if (!current.layout || !latest.current.interactive) {
      return;
    }
    const position =
      (current.point.clientX * 375) / getWindowInfo().windowWidth -
      current.layout.left;
    let next = ratingFromPosition(
      position,
      current.layout.width,
      latest.current.max,
      latest.current.precision
    );
    if (
      commit &&
      !current.moved &&
      latest.current.allowClear &&
      next === current.startValue
    ) {
      next = 0;
    }
    if (next !== current.lastValue) {
      if (
        latest.current.haptics &&
        Math.ceil(next) !== Math.ceil(current.lastValue)
      ) {
        void selectionTick();
      }
      current.lastValue = next;
      latest.current.onChange(next);
    }
    setDisplay(next);
    if (commit) {
      gesture.current = null;
      setDragging(false);
      latest.current.onCommit?.(next);
      nextTick(() => {
        if (mounted.current && !gesture.current) {
          setDisplay(latest.current.value);
        }
      });
    }
  };
  const cancel = useCallback(() => {
    gesture.current = null;
    setDragging(false);
    setDisplay(latest.current.value);
  }, []);
  useEffect(() => {
    setDisplay(value);
  }, [value]);
  useEffect(() => {
    if (!interactive) {
      cancel();
    }
  }, [interactive, cancel]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      gesture.current = null;
    };
  }, []);
  const onTouchStart = (event: unknown) => {
    const [point, extra] = readTouchPoints(event);
    if (!interactive || !point || extra) {
      cancel();
      return;
    }
    const current: RatingGesture = {
      ended: false,
      lastValue: value,
      moved: false,
      point,
      startValue: value,
      startX: point.clientX,
    };
    gesture.current = current;
    setDragging(true);
    measured.refresh(
      () => mounted.current && gesture.current === current,
      (layout) => {
        if (!layout) {
          cancel();
          return;
        }
        current.layout = layout;
        apply(current, current.ended);
      }
    );
  };
  const onTouchMove = (event: unknown) => {
    const { current } = gesture;
    if (!current) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra || point.identifier !== current.point.identifier) {
      cancel();
      return;
    }
    current.point = point;
    current.moved ||= Math.abs(point.clientX - current.startX) > 4;
    apply(current, false);
  };
  const onTouchEnd = (event: unknown) => {
    const { current } = gesture;
    if (!current) {
      return;
    }
    const [point, extra] = readChangedTouchPoints(event);
    if (extra || (point && point.identifier !== current.point.identifier)) {
      cancel();
      return;
    }
    if (point) {
      current.point = point;
      current.moved ||= Math.abs(point.clientX - current.startX) > 4;
    }
    current.ended = true;
    apply(current, true);
  };
  return {
    display,
    dragging,
    id: measured.id,
    onTouchCancel: cancel,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
  };
};
