import { View } from "@tarojs/components";
import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import {
  ENTER_DURATION,
  EXIT_DURATION,
  HEIGHT_DURATION,
  SLIDE_FRACTION,
} from "./constants";

export const AIInputSheetBody = ({
  activeId,
  depth,
  className,
  children,
}: {
  activeId?: string;
  depth: number;
  className?: string;
  children: ReactNode;
}) => {
  const reduced = usePanelReducedMotion();
  const pane = useElementLayout(true, children);
  const previous = useRef({ activeId, children, depth });
  const [exit, setExit] = useState<ReactNode>(null);
  const [direction, setDirection] = useState(1);
  const [layered, setLayered] = useState(false);
  const height = useChartTween(-1, chartCubicOut);
  const enter = useChartTween(1, chartCubicOut);
  const fade = useChartTween(1);
  const h = useSyncExternalStore(
    height.signal.subscribe,
    height.signal.getSnapshot,
    height.signal.getSnapshot
  );
  const p = useSyncExternalStore(
    enter.signal.subscribe,
    enter.signal.getSnapshot,
    enter.signal.getSnapshot
  );
  const opacity = useSyncExternalStore(
    fade.signal.subscribe,
    fade.signal.getSnapshot,
    fade.signal.getSnapshot
  );
  useEffect(() => {
    const old = previous.current;
    previous.current = { activeId, children, depth };
    if (activeId === old.activeId) {
      return;
    }
    setDirection(depth >= old.depth ? 1 : -1);
    setLayered(true);
    if (reduced) {
      setExit(null);
      enter.setImmediate(1);
      return;
    }
    setExit(old.children);
    enter.setImmediate(0);
    enter.timingTo(1, ENTER_DURATION);
    fade.setImmediate(1);
    fade.timingTo(0, EXIT_DURATION);
    const timer = setTimeout(() => setExit(null), EXIT_DURATION);
    return () => clearTimeout(timer);
  }, [
    activeId,
    depth,
    reduced,
    enter.setImmediate,
    enter.timingTo,
    fade.setImmediate,
    fade.timingTo,
  ]);
  useEffect(() => {
    const next = pane.layout?.height;
    if (!next || next <= 0) {
      return;
    }
    if (layered && !reduced) {
      height.timingTo(next, HEIGHT_DURATION);
    } else {
      height.setImmediate(next);
    }
  }, [
    pane.layout?.height,
    layered,
    reduced,
    height.timingTo,
    height.setImmediate,
  ]);
  const offset = getWindowInfo().windowWidth > 0 ? 375 * SLIDE_FRACTION : 60;
  return (
    <View
      className={cn("relative w-full overflow-hidden", className)}
      style={layered && h >= 0 ? { height: `${h * 2}rpx` } : undefined}
    >
      {exit === null ? null : (
        <View
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{ opacity }}
        >
          {exit}
        </View>
      )}
      <View
        className={layered ? "absolute inset-x-0 top-0" : "w-full"}
        style={{
          opacity: p,
          transform: `translateX(${direction * offset * (1 - p) * 2}rpx)`,
        }}
      >
        <View id={pane.id} className="w-full pt-[16px]" aria-live="polite">
          {children}
        </View>
      </View>
    </View>
  );
};
