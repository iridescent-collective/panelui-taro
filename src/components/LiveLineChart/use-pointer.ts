import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import { readCanvasPoints } from "../../primitives/canvas-touch";
import { useChart } from "./context";

export const useLivePointer = () => {
  const context = useChart("LiveLineChart pointer");
  const latest = useRef(context);
  latest.current = context;
  const contact = useRef<{
    identifier: number;
    scale: number;
    time: number;
  } | null>(null);
  const finish = () => {
    if (!contact.current) {
      return;
    }
    contact.current = null;
    latest.current.setActivePoint(null);
  };
  useEffect(() => {
    if (context.status === "loading") {
      finish();
    }
  }, [context.status]);
  useEffect(() => finish, []);
  const resolve = (x: number) => {
    const touch = contact.current;
    if (!touch) {
      return;
    }
    const owner = latest.current;
    if (!owner.data.length || owner.plot.width <= 0) {
      return;
    }
    const clamped = Math.min(
      Math.max(x * touch.scale, owner.plot.left),
      owner.plot.left + owner.plot.width
    );
    const at =
      owner.now.value -
      owner.windowMs +
      ((clamped - owner.plot.left) / owner.plot.width) * owner.windowMs;
    let [best] = owner.data;
    let gap = Infinity;
    for (const point of owner.data) {
      const next = Math.abs(point.time - at);
      if (next < gap) {
        best = point;
        gap = next;
      }
    }
    if (best.time === touch.time) {
      return;
    }
    touch.time = best.time;
    owner.setActivePoint(
      Number.isFinite(best.time) && best.time > 0 ? best : null
    );
  };
  return {
    onTouchCancel: finish,
    onTouchEnd: finish,
    onTouchMove: (event: unknown) => {
      const touch = contact.current;
      if (!touch) {
        return;
      }
      const [point, extra] = readCanvasPoints(event);
      if (!point || extra || point.identifier !== touch.identifier) {
        finish();
        return;
      }
      resolve(point.x);
    },
    onTouchStart: (event: unknown) => {
      finish();
      const [point, extra] = readCanvasPoints(event);
      if (!point || extra || latest.current.status === "loading") {
        return;
      }
      contact.current = {
        identifier: point.identifier,
        scale: 375 / getWindowInfo().windowWidth,
        time: -1,
      };
      resolve(point.x);
    },
  };
};
