import { useEffect, useRef } from "react";

import { selectionTick } from "../../lib/haptics";
import {
  readChangedTouchPoints,
  readTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { SETTLE_SPRING } from "./constants";
import {
  clamp,
  dragFade,
  dragScale,
  focalTranslation,
  hitsRect,
  panBound,
  rubberBandClamp,
  shouldDismiss,
  snapPage,
} from "./geometry";
import type { useViewerOverlayModel } from "./use-overlay-model";

interface Pan {
  point: TouchPoint;
  last: TouchPoint;
  time: number;
  began: number;
  vx: number;
  vy: number;
  mode: "none" | "pan" | "page" | "dismiss";
  x: number;
  y: number;
  pager: number;
}
interface Pinch {
  ids: number[];
  distance: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  focalX: number;
  focalY: number;
}
export const useViewerGestures = (
  model: ReturnType<typeof useViewerOverlayModel>
) => {
  const current = useRef(model);
  current.current = model;
  const pan = useRef<Pan | null>(null);
  const pinch = useRef<Pinch | null>(null);
  const tap = useRef<{
    point: TouchPoint;
    time: number;
  } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sourcePoint = (p: TouchPoint) => ({
    ...p,
    clientX: p.clientX * current.current.metrics.scale,
    clientY: p.clientY * current.current.metrics.scale,
  });
  const settleZoom = () => {
    const m = current.current;
    const f = m.motion.signal.value;
    const target = clamp(f.scale, 1, m.latest.current.props.maxScale);
    if (target <= 1.01) {
      m.motion.spring("scale", 1, SETTLE_SPRING);
      m.motion.spring("tx", 0, SETTLE_SPRING);
      m.motion.spring("ty", 0, SETTLE_SPRING);
      m.motion.timing("chrome", m.chromeOn.current ? 1 : 0, 180);
      return;
    }
    const p = pinch.current;
    const x =
      target === f.scale || !p
        ? f.tx
        : focalTranslation(p.focalX, p.offsetX, p.scale, target);
    const y =
      target === f.scale || !p
        ? f.ty
        : focalTranslation(p.focalY, p.offsetY, p.scale, target);
    const bx = panBound(m.fit.width, target, m.W);
    const by = panBound(m.fit.height, target, m.H);
    m.motion.spring("scale", target, SETTLE_SPRING);
    m.motion.spring("tx", clamp(x, -bx, bx), SETTLE_SPRING);
    m.motion.spring("ty", clamp(y, -by, by), SETTLE_SPRING);
  };
  const settleDrag = () => {
    const m = current.current;
    m.motion.spring("dragX", 0, SETTLE_SPRING);
    m.motion.spring("dragY", 0, SETTLE_SPRING);
    m.motion.spring("shrink", 1, SETTLE_SPRING);
    m.motion.timing("fade", 1, 180);
    m.motion.timing("chrome", m.chromeOn.current ? 1 : 0, 180);
  };
  const cancel = () => {
    const m = current.current;
    if (pinch.current) {
      settleZoom();
    }
    if (pan.current?.mode === "dismiss") {
      settleDrag();
    }
    if (pan.current?.mode === "page") {
      m.motion.spring(
        "pagerX",
        -m.activePage.current * (m.W + 16),
        SETTLE_SPRING
      );
    }
    pan.current = null;
    pinch.current = null;
  };
  useEffect(() => {
    cancel();
  }, [model.W, model.H, model.page]);
  useEffect(
    () => () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
      pan.current = null;
      pinch.current = null;
    },
    []
  );
  const beginPinch = (points: TouchPoint[]) => {
    const [first, second] = points;
    if (!first || !second) {
      return;
    }
    cancel();
    const m = current.current;
    const f = m.motion.signal.value;
    const x = (first.clientX + second.clientX) / 2 - m.W / 2;
    const y = (first.clientY + second.clientY) / 2 - m.H / 2;
    m.motion.set({ scale: f.scale, tx: f.tx, ty: f.ty });
    pinch.current = {
      distance: Math.max(
        1,
        Math.hypot(
          second.clientX - first.clientX,
          second.clientY - first.clientY
        )
      ),
      focalX: x,
      focalY: y,
      ids: [first.identifier, second.identifier],
      offsetX: x - f.tx,
      offsetY: y - f.ty,
      scale: f.scale,
    };
    pan.current = null;
    m.motion.timing("chrome", 0, 120);
  };
  const singleTap = (point: TouchPoint) => {
    const m = current.current;
    if (m.phase.current !== "open") {
      return;
    }
    const f = m.motion.signal.value;
    if (!hitsRect(point.clientX, point.clientY, m.fit, f.scale, f.tx, f.ty)) {
      m.startClose();
      m.latest.current.props.onRequestClose();
      return;
    }
    m.chromeOn.current = !m.chromeOn.current;
    m.motion.timing("chrome", m.chromeOn.current ? 1 : 0, 180);
  };
  const doubleTap = (point: TouchPoint) => {
    const m = current.current;
    const f = m.motion.signal.value;
    if (f.scale > 1.01) {
      m.motion.spring("scale", 1, SETTLE_SPRING);
      m.motion.spring("tx", 0, SETTLE_SPRING);
      m.motion.spring("ty", 0, SETTLE_SPRING);
      m.motion.timing("chrome", m.chromeOn.current ? 1 : 0, 180);
      return;
    }
    const target = Math.min(
      m.latest.current.props.doubleTapScale,
      m.latest.current.props.maxScale
    );
    const x = point.clientX - m.W / 2;
    const y = point.clientY - m.H / 2;
    const bx = panBound(m.fit.width, target, m.W);
    const by = panBound(m.fit.height, target, m.H);
    m.motion.spring("scale", target, SETTLE_SPRING);
    m.motion.spring(
      "tx",
      clamp(focalTranslation(x, x, 1, target), -bx, bx),
      SETTLE_SPRING
    );
    m.motion.spring(
      "ty",
      clamp(focalTranslation(y, y, 1, target), -by, by),
      SETTLE_SPRING
    );
    m.motion.timing("chrome", 0, 120);
  };
  const move = (point: TouchPoint) => {
    const p = pan.current;
    if (!p) {
      return;
    }
    const m = current.current;
    const dx = point.clientX - p.point.clientX;
    const dy = point.clientY - p.point.clientY;
    const f = m.motion.signal.value;
    if (p.mode === "none") {
      if (Math.hypot(dx, dy) < 8) {
        return;
      }
      if (f.scale > 1.01) {
        p.mode = "pan";
        m.motion.set({ tx: f.tx, ty: f.ty });
      } else if (m.count > 1 && Math.abs(dx) > Math.abs(dy)) {
        p.mode = "page";
        m.motion.set({ pagerX: f.pagerX });
      } else {
        p.mode = "dismiss";
        m.motion.timing("chrome", 0, 120);
        if (m.latest.current.props.haptics) {
          void selectionTick();
        }
      }
    }
    const dt = Date.now() - p.time;
    if (dt > 0) {
      p.vx = ((point.clientX - p.last.clientX) * 1000) / dt;
      p.vy = ((point.clientY - p.last.clientY) * 1000) / dt;
    }
    p.last = point;
    p.time = Date.now();
    if (p.mode === "pan") {
      const bx = panBound(m.fit.width, f.scale, m.W);
      const by = panBound(m.fit.height, f.scale, m.H);
      m.motion.set({
        tx: rubberBandClamp(p.x + dx, -bx, bx, m.W),
        ty: rubberBandClamp(p.y + dy, -by, by, m.H),
      });
    }
    if (p.mode === "page") {
      m.motion.set({
        pagerX: rubberBandClamp(
          p.pager + dx * m.direction,
          -(m.count - 1) * (m.W + 16),
          0,
          m.W
        ),
      });
    }
    if (p.mode === "dismiss") {
      m.motion.set({
        dragX: dx,
        dragY: dy,
        fade: dragFade(dy, m.H),
        shrink: dragScale(dy, m.H),
      });
    }
  };
  const finishPan = (p: Pan, point: TouchPoint, vx: number, vy: number) => {
    const m = current.current;
    const f = m.motion.signal.value;
    if (p.mode === "dismiss") {
      if (shouldDismiss(point.clientY - p.point.clientY, vy)) {
        m.startClose(vx, vy);
        m.latest.current.props.onRequestClose();
      } else {
        settleDrag();
      }
      return true;
    }
    if (p.mode === "page") {
      const target = snapPage(
        f.pagerX,
        vx * m.direction,
        m.activePage.current,
        m.count,
        m.W + 16
      );
      m.motion.spring("pagerX", -target * (m.W + 16), {
        ...SETTLE_SPRING,
        velocity: vx * m.direction,
      });
      if (target !== m.activePage.current) {
        m.activePage.current = target;
        m.latest.current.props.onIndexChange(target);
      }
      return true;
    }
    if (p.mode === "pan") {
      const bx = panBound(m.fit.width, f.scale, m.W);
      const by = panBound(m.fit.height, f.scale, m.H);
      if (bx === 0 || Math.abs(f.tx) > bx) {
        m.motion.spring("tx", clamp(f.tx, -bx, bx), SETTLE_SPRING);
      } else {
        m.motion.decay("tx", vx, -bx, bx);
      }
      if (by === 0 || Math.abs(f.ty) > by) {
        m.motion.spring("ty", clamp(f.ty, -by, by), SETTLE_SPRING);
      } else {
        m.motion.decay("ty", vy, -by, by);
      }
      return true;
    }
    return false;
  };
  return {
    onTouchCancel: cancel,
    onTouchEnd: (event: unknown) => {
      if (
        !current.current.latest.current.props.open ||
        current.current.phase.current !== "open"
      ) {
        pan.current = null;
        pinch.current = null;
        return;
      }
      if (pinch.current) {
        settleZoom();
        pinch.current = null;
        pan.current = null;
        return;
      }
      const p = pan.current;
      if (!p) {
        return;
      }
      const points = readChangedTouchPoints(event).map(sourcePoint);
      if (
        points.length > 1 ||
        (points[0] && points[0].identifier !== p.point.identifier)
      ) {
        cancel();
        return;
      }
      const point = points[0] ?? p.last;
      if (
        point.clientX !== p.last.clientX ||
        point.clientY !== p.last.clientY
      ) {
        move(point);
      }
      pan.current = null;
      const stale = Date.now() - p.time > 100;
      const vx = stale ? 0 : p.vx;
      const vy = stale ? 0 : p.vy;
      if (finishPan(p, point, vx, vy)) {
        return;
      }
      if (Date.now() - p.began > 500) {
        return;
      }
      if (
        tap.current &&
        Date.now() - tap.current.time <= 250 &&
        Math.hypot(
          point.clientX - tap.current.point.clientX,
          point.clientY - tap.current.point.clientY
        ) <= 24
      ) {
        if (timer.current !== null) {
          clearTimeout(timer.current);
        }
        tap.current = null;
        doubleTap(point);
        return;
      }
      tap.current = { point, time: Date.now() };
      timer.current = setTimeout(() => {
        tap.current = null;
        singleTap(point);
      }, 250);
    },
    onTouchMove: (event: unknown) => {
      if (
        !current.current.latest.current.props.open ||
        current.current.phase.current !== "open"
      ) {
        pan.current = null;
        pinch.current = null;
        return;
      }
      const points = readTouchPoints(event).map(sourcePoint);
      const p = pinch.current;
      if (p) {
        if (
          points.length !== 2 ||
          !points.every((point) => p.ids.includes(point.identifier))
        ) {
          cancel();
          return;
        }
        const [first, second] = points;
        const m = current.current;
        const scale = rubberBandClamp(
          (p.scale *
            Math.hypot(
              second.clientX - first.clientX,
              second.clientY - first.clientY
            )) /
            p.distance,
          1,
          m.latest.current.props.maxScale,
          m.latest.current.props.maxScale
        );
        p.focalX = (first.clientX + second.clientX) / 2 - m.W / 2;
        p.focalY = (first.clientY + second.clientY) / 2 - m.H / 2;
        m.motion.set({
          scale,
          tx: focalTranslation(p.focalX, p.offsetX, p.scale, scale),
          ty: focalTranslation(p.focalY, p.offsetY, p.scale, scale),
        });
        return;
      }
      if (points.length === 2) {
        beginPinch(points);
        return;
      }
      if (
        points.length !== 1 ||
        points[0].identifier !== pan.current?.point.identifier
      ) {
        cancel();
        return;
      }
      move(points[0]);
    },
    onTouchStart: (event: unknown) => {
      const m = current.current;
      if (m.phase.current !== "open") {
        return;
      }
      const points = readTouchPoints(event).map(sourcePoint);
      if (points.length === 2) {
        beginPinch(points);
        return;
      }
      if (points.length !== 1) {
        cancel();
        return;
      }
      cancel();
      const [point] = points;
      const f = m.motion.signal.value;
      pan.current = {
        began: Date.now(),
        last: point,
        mode: "none",
        pager: f.pagerX,
        point,
        time: Date.now(),
        vx: 0,
        vy: 0,
        x: f.tx,
        y: f.ty,
      };
    },
  };
};
