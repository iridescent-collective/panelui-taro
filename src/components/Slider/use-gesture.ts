import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import type { ElementLayout } from "../../hooks/use-element-layout";
import {
  readTouchPoints,
  readChangedTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { clampSlider, pickSliderThumb, sliderPointFraction } from "./math";
import type { SliderThumb } from "./types";
import type { SliderState } from "./use-state";

interface SliderGestureConfig {
  layout: ElementLayout | null;
  thumbWidth: number;
  sign: number;
  disabled: boolean;
  minStepsBetweenThumbs: number;
}
interface Contact {
  point: TouchPoint;
  last: TouchPoint;
  low: number;
  high: number;
  thumb: SliderThumb;
  scale: number;
  started: number;
  active: boolean;
}
const TAP_MAX_DISTANCE = 10;
export const useSliderGesture = (
  state: SliderState,
  config: SliderGestureConfig
) => {
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
  }, [
    config.disabled,
    config.sign,
    config.layout?.width,
    state.min,
    state.max,
    state.step,
    state.isRange,
  ]);
  useEffect(
    () => () => {
      contact.current = null;
    },
    []
  );
  const onTouchStart = (event: unknown) => {
    const { state: owner, config: settings } = latest.current;
    if (settings.disabled || !settings.layout || settings.layout.width <= 0) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra) {
      cancel();
      return;
    }
    cancel();
    const scale = 375 / getWindowInfo().windowWidth;
    const x = point.clientX * scale - settings.layout.left;
    const current = owner.read();
    const thumb = owner.isRange
      ? pickSliderThumb(
          x,
          settings.layout.width,
          settings.thumbWidth,
          settings.sign,
          current.low,
          current.high
        )
      : "high";
    const start = owner.begin(thumb);
    contact.current = {
      ...start,
      active: false,
      last: point,
      point,
      scale,
      started: Date.now(),
      thumb,
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
    if (!current.active && Math.abs(y) > 16) {
      cancel();
      return;
    }
    current.last = point;
    if (!current.active && Math.abs(x) < 10) {
      return;
    }
    current.active = true;
    setActive(true);
    const travel = Math.max(
      (settings.layout?.width ?? 0) - settings.thumbWidth,
      1
    );
    const span = owner.max > owner.min ? owner.max - owner.min : 1;
    const gap =
      settings.minStepsBetweenThumbs > 0
        ? (settings.minStepsBetweenThumbs * owner.step) / span
        : 0;
    const delta = (x * settings.sign) / travel;
    const live = owner.read();
    if (!owner.isRange) {
      owner.move(0, clampSlider(current.high + delta, 0, 1), "high");
    } else if (current.thumb === "low") {
      owner.move(
        clampSlider(current.low + delta, 0, Math.max(live.high - gap, 0)),
        live.high,
        "low"
      );
    } else {
      owner.move(
        live.low,
        clampSlider(current.high + delta, Math.min(live.low + gap, 1), 1),
        "high"
      );
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
    if (current.active) {
      owner.finish(current.thumb);
      return;
    }
    const released = point ?? current.last;
    const tapDistance = Math.hypot(
      (released.clientX - current.point.clientX) * current.scale,
      (released.clientY - current.point.clientY) * current.scale
    );
    if (
      Date.now() - current.started > 250 ||
      !settings.layout ||
      tapDistance > TAP_MAX_DISTANCE
    ) {
      owner.cancel();
      return;
    }
    const x = released.clientX * current.scale - settings.layout.left;
    const next = sliderPointFraction(
      x,
      settings.layout.width,
      settings.thumbWidth,
      settings.sign
    );
    const live = owner.read();
    const span = owner.max > owner.min ? owner.max - owner.min : 1;
    const gap =
      settings.minStepsBetweenThumbs > 0
        ? (settings.minStepsBetweenThumbs * owner.step) / span
        : 0;
    if (!owner.isRange) {
      owner.tap(0, next, "high");
    } else if (current.thumb === "low") {
      owner.tap(Math.min(next, Math.max(live.high - gap, 0)), live.high, "low");
    } else {
      owner.tap(live.low, Math.max(next, Math.min(live.low + gap, 1)), "high");
    }
  };
  return {
    active,
    onTouchCancel: cancel,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
  };
};
