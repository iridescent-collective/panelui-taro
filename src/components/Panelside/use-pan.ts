import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import {
  readTouchPoints,
  readChangedTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { OFFSETS } from "./constants";
import { panelsideOffset, panelsideRelease } from "./math";
import type { PanelsideSwipeFrom } from "./types";

interface PanOptions {
  enabled: boolean;
  open: boolean;
  from: PanelsideSwipeFrom;
  edge: number;
  sign: number;
  left: number;
  width: number;
  extent: number;
  translation: () => number;
  update: (value: number) => void;
  restore: () => void;
  finish: (next: boolean, velocity: number) => void;
}
export const usePanelsidePan = (options: PanOptions) => {
  const latest = useRef(options);
  latest.current = options;
  const contact = useRef<{
    origin: TouchPoint;
    last: TouchPoint;
    active: boolean;
    time: number;
    velocity: number;
    distance: number;
  } | null>(null);
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
  useEffect(cancel, [
    options.enabled,
    options.open,
    options.from,
    options.edge,
    options.sign,
    options.left,
    options.width,
    options.extent,
  ]);
  useEffect(
    () => () => {
      contact.current = null;
    },
    []
  );
  const move = (point: TouchPoint) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    const config = latest.current;
    const scale = 375 / getWindowInfo().windowWidth;
    const dx = (point.clientX - current.origin.clientX) * scale;
    const dy = (point.clientY - current.origin.clientY) * scale;
    const offsets = OFFSETS[config.from];
    if (!current.active && Math.abs(dy) > offsets.fail) {
      cancel();
      return;
    }
    if (!current.active && Math.abs(dx) <= offsets.activate) {
      return;
    }
    current.active = true;
    setActive(true);
    const change = (point.clientX - current.last.clientX) * scale;
    const now = Date.now();
    const dt = now - current.time;
    if (change !== 0 && dt > 0) {
      current.velocity = (change * 1000) / dt;
      current.time = now;
    }
    current.last = point;
    current.distance = dx;
    config.update(
      panelsideOffset(config.translation(), change, config.sign, config.extent)
    );
  };
  return {
    active,
    onTouchCancel: cancel,
    onTouchEnd: (event: unknown) => {
      const { current } = contact;
      if (!current) {
        return;
      }
      const point = readChangedTouchPoints(event).find(
        (p) => p.identifier === current.origin.identifier
      );
      if (point) {
        move(point);
      }
      if (!contact.current) {
        return;
      }
      stop();
      if (!current.active) {
        latest.current.restore();
        return;
      }
      const config = latest.current;
      const velocity = Date.now() - current.time > 100 ? 0 : current.velocity;
      const next = panelsideRelease(
        current.distance,
        velocity,
        config.sign,
        config.open
      );
      config.finish(next, velocity * config.sign);
    },
    onTouchMove: (event: unknown) => {
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
    },
    onTouchStart: (event: unknown) => {
      cancel();
      const config = latest.current;
      if (!config.enabled) {
        return;
      }
      const [point, extra] = readTouchPoints(event);
      if (!point || extra) {
        return;
      }
      const x =
        (point.clientX * 375) / getWindowInfo().windowWidth - config.left;
      if (
        !config.open &&
        config.from === "edge" &&
        (config.sign === 1 ? x > config.edge : x < config.width - config.edge)
      ) {
        return;
      }
      contact.current = {
        active: false,
        distance: 0,
        last: point,
        origin: point,
        time: Date.now(),
        velocity: 0,
      };
    },
  };
};
