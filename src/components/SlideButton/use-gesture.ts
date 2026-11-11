import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import {
  readTouchPoints,
  readChangedTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import {
  isCommitted,
  offsetFor,
  progressFor,
  resolveThreshold,
} from "./slide-button-track";
import type { SlideState } from "./use-state";

interface Configuration {
  travel: number;
  sign: number;
  disabled: boolean;
  threshold?: number;
}
interface Contact {
  point: TouchPoint;
  last: TouchPoint;
  scale: number;
  origin: number;
  time: number;
  velocity: number;
  active: boolean;
  armed: boolean;
}
export const useSlideGesture = (state: SlideState, config: Configuration) => {
  const contact = useRef<Contact | null>(null);
  const latest = useRef({ config, state });
  latest.current = { config, state };
  const [active, setActive] = useState(false);
  const cancel = () => {
    if (!contact.current) {
      return;
    }
    contact.current = null;
    setActive(false);
    latest.current.state.cancel();
  };
  useEffect(() => {
    cancel();
  }, [config.disabled, config.sign, config.travel, state.completed]);
  useEffect(
    () => () => {
      contact.current = null;
    },
    []
  );
  const onTouchStart = (event: unknown) => {
    const { state: owner, config: settings } = latest.current;
    if (settings.disabled || settings.travel <= 0) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra) {
      cancel();
      return;
    }
    cancel();
    const progress = owner.begin();
    if (progress === null) {
      return;
    }
    contact.current = {
      active: false,
      armed: false,
      last: point,
      origin: progress * settings.travel,
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
    const { state: owner, config: settings } = latest.current;
    const x = (point.clientX - current.point.clientX) * current.scale;
    const y = (point.clientY - current.point.clientY) * current.scale;
    if (!current.active && Math.abs(y) > 14) {
      cancel();
      return;
    }
    if (!current.active && Math.abs(x) < 12) {
      return;
    }
    current.active = true;
    setActive(true);
    const elapsed = Date.now() - current.time;
    if (elapsed > 0) {
      current.velocity =
        (((point.clientX - current.last.clientX) * current.scale) / elapsed) *
        1000;
    }
    current.last = point;
    current.time = Date.now();
    const next = progressFor(
      offsetFor(current.origin + x * settings.sign, settings.travel),
      settings.travel
    );
    owner.move(next);
    const armed = next >= resolveThreshold(settings.threshold);
    if (armed !== current.armed) {
      current.armed = armed;
      if (armed) {
        owner.tick();
      }
    }
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
    const { state: owner, config: settings } = latest.current;
    if (!current.active || settings.disabled || settings.travel <= 0) {
      owner.cancel();
      return;
    }
    const speed =
      Date.now() - current.time > 100 ? 0 : current.velocity * settings.sign;
    const committed = isCommitted(
      owner.read(),
      speed,
      settings.travel,
      resolveThreshold(settings.threshold)
    );
    owner.release(committed, speed);
  };
  return {
    active,
    onTouchCancel: cancel,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
  };
};
