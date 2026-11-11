import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import type { useElementLayout } from "../../hooks/use-element-layout";
import { readTouchPoints } from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import type { CropperContextValue } from "./context";
import { transformGesture } from "./gesture";

interface CropGestureSession {
  centre: { x: number; y: number } | null;
  latest: TouchPoint[];
  points: TouchPoint[];
  units: number;
}
export const useCropGesture = (
  owner: CropperContextValue,
  refresh: ReturnType<typeof useElementLayout>["refresh"]
) => {
  const latest = useRef(owner);
  latest.current = owner;
  const current = useRef<CropGestureSession | null>(null);
  const mounted = useRef(true);
  const [active, setActive] = useState(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      current.current = null;
    };
  }, []);
  useEffect(() => {
    current.current = null;
    setActive(false);
  }, [owner.source.uri, owner.frame, owner.bounds]);
  const apply = (session: CropGestureSession, points: TouchPoint[]) => {
    const model = latest.current;
    if (
      model.frame &&
      session.centre &&
      points.length &&
      session.points.length
    ) {
      model.write(
        transformGesture(
          model.raw.current,
          session.points,
          points,
          session.centre,
          session.units
        )
      );
    }
    session.points = points;
  };
  const onTouchStart = (event: unknown) => {
    const points = readTouchPoints(event);
    if (!points.length || !latest.current.frame) {
      return;
    }
    latest.current.begin();
    const session: CropGestureSession = {
      centre: null,
      latest: points,
      points,
      units: 375 / getWindowInfo().windowWidth,
    };
    current.current = session;
    setActive(true);
    refresh(
      () => mounted.current && current.current === session,
      (layout) => {
        if (!mounted.current || current.current !== session) {
          return;
        }
        if (!layout || layout.width <= 0 || layout.height <= 0) {
          current.current = null;
          setActive(false);
          return;
        }
        session.centre = {
          x: (layout.left + layout.width / 2) / session.units,
          y: (layout.top + layout.height / 2) / session.units,
        };
        apply(session, session.latest);
      }
    );
  };
  const onTouchMove = (event: unknown) => {
    const session = current.current;
    if (!session) {
      return;
    }
    const points = readTouchPoints(event);
    session.latest = points;
    if (session.centre) {
      apply(session, points);
    }
  };
  const finish = () => {
    current.current = null;
    setActive(false);
    const model = latest.current;
    model.write(model.raw.current, true);
  };
  const onTouchEnd = (event: unknown) => {
    const points = readTouchPoints(event);
    const session = current.current;
    if (points.length && session) {
      session.points = points;
      session.latest = points;
      return;
    }
    finish();
  };
  return {
    active,
    onTouchCancel: finish,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
  };
};
