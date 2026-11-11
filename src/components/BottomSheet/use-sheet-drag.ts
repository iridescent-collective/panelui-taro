import { nextTick } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import type { ElementLayout } from "../../hooks/use-element-layout";
import { selectionTick } from "../../lib/haptics";
import { readTouchPoints } from "../../primitives/touch-event";
import { shouldDismissSheet } from "./geometry";
import type { SheetSurfaceStore } from "./surface-store";

type TouchEvent = unknown;
interface Drag {
  identifier: number;
  origin: number;
  last: number;
  time: number;
  velocity: number;
  active: boolean;
  measured: boolean;
  pending: number;
  base: number;
}
export const useSheetDrag = ({
  open,
  dismissible,
  translation,
  setTranslation,
  setDragging,
  scale,
  height,
  gap,
  surface,
  close,
  measure,
}: {
  open: boolean;
  dismissible: boolean;
  translation: number;
  setTranslation: (value: number) => void;
  setDragging: (value: boolean) => void;
  scale: number;
  height: number;
  gap: number;
  surface: SheetSurfaceStore;
  close: () => void;
  measure: (
    active: () => boolean,
    listener: (layout: ElementLayout | null) => void
  ) => void;
}) => {
  const drag = useRef<Drag | null>(null);
  const live = useRef({ dismissible, open, translation });
  live.current = { dismissible, open, translation };
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      drag.current = null;
      surface.setHold(undefined);
    };
  }, [surface]);
  useEffect(() => {
    if (!dismissible || !open) {
      drag.current = null;
      surface.setHold(undefined);
      setDragging(false);
      setTranslation(open ? 0 : height);
    }
  }, [dismissible, height, open, setDragging, setTranslation, surface]);
  const apply = (change: number) => {
    const current = live.current.translation;
    if (surface.hasBody && surface.offset > 0 && current <= 0) {
      return;
    }
    const next = current + change;
    if (next <= 0 && surface.hasBody) {
      live.current.translation = 0;
      setTranslation(0);
      surface.setHold(undefined);
      return;
    }
    if (surface.getSnapshot() === undefined) {
      surface.setHold(Math.max(surface.offset, 0));
    }
    const held = next > 0 ? next : next / 3;
    live.current.translation = held;
    setTranslation(held);
  };
  const abort = () => {
    drag.current = null;
    surface.setHold(undefined);
    setDragging(false);
    live.current.translation = live.current.open ? 0 : height;
    setTranslation(live.current.translation);
  };
  const start = (event: TouchEvent) => {
    const touches = readTouchPoints(event);
    if (touches.length !== 1) {
      abort();
      return;
    }
    const [touch] = touches;
    if (
      !touch ||
      touches.length !== 1 ||
      !live.current.open ||
      !live.current.dismissible
    ) {
      return;
    }
    const state: Drag = {
      active: false,
      base: live.current.translation,
      identifier: touch.identifier,
      last: touch.clientY * scale,
      measured: false,
      origin: touch.clientY * scale,
      pending: 0,
      time: Date.now(),
      velocity: 0,
    };
    drag.current = state;
    measure(
      () => mounted.current && drag.current === state,
      (layout) => {
        state.base = layout
          ? Math.max(0, layout.top - (height - layout.height - gap))
          : live.current.translation;
        state.measured = true;
        if (state.active) {
          live.current.translation = state.base;
          apply(state.pending);
          if (surface.getSnapshot() !== undefined) {
            setDragging(true);
          }
        }
      }
    );
  };
  const move = (event: TouchEvent) => {
    const touches = readTouchPoints(event);
    if (touches.length !== 1) {
      abort();
      return;
    }
    const state = drag.current;
    const touch = touches.find(
      (point) => point.identifier === state?.identifier
    );
    if (
      !state ||
      !touch ||
      touches.length !== 1 ||
      !live.current.dismissible ||
      !live.current.open
    ) {
      return;
    }
    const point = touch.clientY * scale;
    const elapsed = Math.max(1, Date.now() - state.time);
    const change = point - (state.active ? state.last : state.origin);
    state.velocity = ((point - state.last) / elapsed) * 1000;
    state.time = Date.now();
    state.last = point;
    if (!state.active && Math.abs(point - state.origin) < 12) {
      return;
    }
    if (!state.active) {
      state.active = true;
      live.current.translation = state.base;
    }
    if (!state.measured) {
      state.pending += change;
      return;
    }
    apply(change);
    if (surface.getSnapshot() !== undefined) {
      setDragging(true);
    }
  };
  const finish = async (cancelled: boolean) => {
    const state = drag.current;
    drag.current = null;
    const owned = surface.getSnapshot() !== undefined;
    surface.setHold(undefined);
    setDragging(false);
    if (!state?.active || !owned || !live.current.open) {
      return;
    }
    if (
      !cancelled &&
      live.current.dismissible &&
      shouldDismissSheet(live.current.translation, state.velocity)
    ) {
      close();
      nextTick(() => {
        if (mounted.current && live.current.open) {
          setTranslation(0);
        }
      });
    } else {
      setTranslation(0);
      await selectionTick();
    }
  };
  return {
    onTouchCancel: async () => {
      await finish(true);
    },
    onTouchEnd: async () => {
      await finish(false);
    },
    onTouchMove: move,
    onTouchStart: start,
  };
};
