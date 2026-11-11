import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import {
  readTouchPoints,
  readChangedTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { pinchFlow } from "./geometry";
import type { FlowViewport } from "./types";

interface CameraOptions {
  locked: boolean;
  pan: boolean;
  pinch: boolean;
  min: number;
  max: number;
  left: number;
  top: number;
  read: () => FlowViewport;
  write: (value: FlowViewport) => void;
  report: (value: FlowViewport) => void;
}
const midpoint = (points: TouchPoint[]) => {
  const [first, second] = points;
  if (!first) {
    return { x: 0, y: 0 };
  }
  return {
    x: second ? (first.clientX + second.clientX) / 2 : first.clientX,
    y: second ? (first.clientY + second.clientY) / 2 : first.clientY,
  };
};
const distance = (points: TouchPoint[]) => {
  const [a, b] = points;
  return a && b ? Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) : 0;
};
export const useFlowCamera = (options: CameraOptions) => {
  const latest = useRef(options);
  latest.current = options;
  const contact = useRef<{
    mode: "pan" | "pinch";
    origin: {
      x: number;
      y: number;
    };
    span: number;
    initial: FlowViewport;
    active: boolean;
    ids: number[];
  } | null>(null);
  const [active, setActive] = useState(false);
  const reset = () => {
    contact.current = null;
    setActive(false);
  };
  useEffect(reset, [
    options.locked,
    options.pan,
    options.pinch,
    options.min,
    options.max,
    options.left,
    options.top,
  ]);
  useEffect(
    () => () => {
      contact.current = null;
    },
    []
  );
  const begin = (points: TouchPoint[]) => {
    const config = latest.current;
    if (config.locked || !points.length || points.length > 2) {
      reset();
      return;
    }
    const mode = points.length === 2 && config.pinch ? "pinch" : "pan";
    if (mode === "pan" && !config.pan) {
      reset();
      return;
    }
    contact.current = {
      active: mode === "pinch",
      ids: points.map((point) => point.identifier),
      initial: config.read(),
      mode,
      origin: midpoint(points),
      span: distance(points),
    };
    setActive(mode === "pinch");
  };
  const move = (points: TouchPoint[]) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    if (
      points.length !== current.ids.length ||
      points.some((point) => !current.ids.includes(point.identifier))
    ) {
      begin(points);
      return;
    }
    const config = latest.current;
    const center = midpoint(points);
    const scale = 375 / getWindowInfo().windowWidth;
    if (current.mode === "pinch") {
      if (current.span <= 0) {
        return;
      }
      const focal = {
        x: center.x * scale - config.left,
        y: center.y * scale - config.top,
      };
      config.write(
        pinchFlow(
          current.initial,
          focal,
          distance(points) / current.span,
          config.min,
          config.max
        )
      );
      return;
    }
    const dx = (center.x - current.origin.x) * scale;
    const dy = (center.y - current.origin.y) * scale;
    if (!current.active && Math.hypot(dx, dy) < 4) {
      return;
    }
    current.active = true;
    setActive(true);
    config.write({
      x: current.initial.x + dx,
      y: current.initial.y + dy,
      zoom: current.initial.zoom,
    });
  };
  return {
    active,
    onTouchCancel: reset,
    onTouchEnd: (event: unknown) => {
      const { current } = contact;
      if (!current) {
        return;
      }
      const points = readTouchPoints(event);
      if (points.length) {
        begin(points);
        return;
      }
      if (current.mode === "pan") {
        const last = readChangedTouchPoints(event).find((point) =>
          current.ids.includes(point.identifier)
        );
        if (last) {
          move([last]);
        }
      }
      const moved = current.active;
      reset();
      if (moved) {
        latest.current.report(latest.current.read());
      }
    },
    onTouchMove: (event: unknown) => move(readTouchPoints(event)),
    onTouchStart: (event: unknown) => begin(readTouchPoints(event)),
  };
};
