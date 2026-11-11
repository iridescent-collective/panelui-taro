import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import {
  readChangedTouchPoints,
  readTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { carouselDragPosition, carouselReleaseIndex } from "./math";
import type { CarouselOrientation } from "./types";

interface CarouselPanOptions {
  enabled: boolean;
  axis: CarouselOrientation;
  itemSize: number;
  count: number;
  loop: boolean;
  begin: () => number;
  update: (progress: number) => void;
  finish: (index?: number) => void;
}
interface CarouselContact {
  point: TouchPoint;
  last: TouchPoint;
  scale: number;
  from: number;
  active: boolean;
  time: number;
  moved: number;
  velocity: number;
}
export const useCarouselPan = (options: CarouselPanOptions) => {
  const latest = useRef(options);
  latest.current = options;
  const contact = useRef<CarouselContact | null>(null);
  const [active, setActive] = useState(false);
  const cancel = () => {
    if (!contact.current) {
      return;
    }
    contact.current = null;
    setActive(false);
    latest.current.finish();
  };
  useEffect(() => {
    cancel();
  }, [
    options.enabled,
    options.axis,
    options.itemSize,
    options.count,
    options.loop,
  ]);
  useEffect(
    () => () => {
      contact.current = null;
    },
    []
  );
  const onTouchStart = (event: unknown) => {
    cancel();
    const { current } = latest;
    if (!current.enabled || current.count <= 1 || current.itemSize <= 0) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra) {
      return;
    }
    contact.current = {
      active: false,
      from: current.begin(),
      last: point,
      moved: 0,
      point,
      scale: 375 / getWindowInfo().windowWidth,
      time: Date.now(),
      velocity: 0,
    };
  };
  const onTouchMove = (event: unknown) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra || point.identifier !== current.point.identifier) {
      cancel();
      return;
    }
    const horizontal = latest.current.axis === "horizontal";
    const dx = (point.clientX - current.point.clientX) * current.scale;
    const dy = (point.clientY - current.point.clientY) * current.scale;
    const moved = horizontal ? dx : dy;
    const cross = horizontal ? dy : dx;
    if (
      !current.active &&
      Math.abs(cross) > 10 &&
      Math.abs(cross) > Math.abs(moved)
    ) {
      cancel();
      return;
    }
    if (!current.active && Math.abs(moved) <= 10) {
      return;
    }
    current.active = true;
    setActive(true);
    const elapsed = Date.now() - current.time;
    if (elapsed > 0) {
      current.velocity =
        ((horizontal
          ? point.clientX - current.last.clientX
          : point.clientY - current.last.clientY) *
          current.scale *
          1000) /
        elapsed;
    }
    current.last = point;
    current.time = Date.now();
    current.moved = moved;
    const config = latest.current;
    config.update(
      carouselDragPosition(
        current.from,
        moved,
        config.itemSize,
        config.count,
        config.loop
      )
    );
  };
  const onTouchEnd = (event: unknown) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    const [point, extra] = readChangedTouchPoints(event);
    if (extra || (point && point.identifier !== current.point.identifier)) {
      cancel();
      return;
    }
    contact.current = null;
    setActive(false);
    const config = latest.current;
    const elapsed = Date.now() - current.time;
    let velocity = elapsed > 100 ? 0 : current.velocity;
    if (point) {
      const horizontal = config.axis === "horizontal";
      const dx = (point.clientX - current.point.clientX) * current.scale;
      const dy = (point.clientY - current.point.clientY) * current.scale;
      const moved = horizontal ? dx : dy;
      const cross = horizontal ? dy : dx;
      const finalDelta =
        (horizontal
          ? point.clientX - current.last.clientX
          : point.clientY - current.last.clientY) * current.scale;
      if (finalDelta !== 0 && elapsed > 0) {
        velocity = (finalDelta * 1000) / elapsed;
      }
      current.moved = moved;
      if (
        !current.active &&
        Math.abs(moved) > 10 &&
        Math.abs(moved) >= Math.abs(cross)
      ) {
        current.active = true;
      }
    }
    config.finish(
      current.active
        ? carouselReleaseIndex(
            current.from,
            current.moved,
            velocity,
            config.itemSize
          )
        : undefined
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
