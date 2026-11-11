import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import { readCanvasPoints } from "../../primitives/canvas-touch";
import { usePlot } from "./context";
import { plotCursorIndex } from "./math";

export const usePlotPointer = (
  resolvePoint?: (x: number, y: number) => number
) => {
  const latestResolver = useRef(resolvePoint);
  latestResolver.current = resolvePoint;
  const context = usePlot("Plot pointer");
  const latest = useRef(context);
  latest.current = context;
  const contact = useRef<{
    identifier: number;
    index: number;
    scale: number;
  } | null>(null);
  const finish = () => {
    if (!contact.current) {
      return;
    }
    contact.current = null;
    latest.current.setActiveIndexJS(-1);
  };
  useEffect(() => {
    finish();
  }, [
    context.data,
    context.status,
    context.plot.width,
    context.plot.left,
    context.plot.height,
    context.plot.top,
  ]);
  useEffect(() => finish, []);
  const resolve = (x: number, y: number) => {
    const { current } = contact;
    if (!current) {
      return;
    }
    const owner = latest.current;
    const next = latestResolver.current
      ? latestResolver.current(x * current.scale, y * current.scale)
      : plotCursorIndex(
          x * current.scale,
          owner.data.length,
          owner.plot,
          owner.xScale === "band"
        );
    if (next < 0 || next === current.index) {
      return;
    }
    current.index = next;
    owner.setActiveIndexJS(next);
  };
  const onTouchStart = (event: unknown) => {
    finish();
    const [point, extra] = readCanvasPoints(event);
    if (!point || extra || latest.current.status === "loading") {
      return;
    }
    contact.current = {
      identifier: point.identifier,
      index: -1,
      scale: 375 / getWindowInfo().windowWidth,
    };
    resolve(point.x, point.y);
  };
  const onTouchMove = (event: unknown) => {
    if (!contact.current) {
      return;
    }
    const [point, extra] = readCanvasPoints(event);
    if (!point || extra || point.identifier !== contact.current.identifier) {
      finish();
      return;
    }
    resolve(point.x, point.y);
  };
  return {
    onTouchCancel: finish,
    onTouchEnd: finish,
    onTouchMove,
    onTouchStart,
  };
};
