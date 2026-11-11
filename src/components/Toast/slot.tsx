import { View } from "@tarojs/components";
import { useCallback, useEffect, useMemo } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSourceSpring } from "../../hooks/use-source-spring";
import { cn } from "../../lib/utils";
import { buildToastContent } from "./notification";
import { toastStore } from "./toast-store";
import type { ToastRecord } from "./use-records";
import { useToastSwipe } from "./use-swipe";

interface ToastSlotProps {
  record: ToastRecord;
  frontHeight?: number;
  measure: (id: string, height?: number) => void;
}
export const ToastSlot = ({ record, frontHeight, measure }: ToastSlotProps) => {
  const { item, index, total, departing } = record;
  const reduced = usePanelReducedMotion();
  const placement = item.placement ?? "bottom";
  const hide = useCallback(() => toastStore.hide(item.id), [item.id]);
  const content = useMemo(
    () => buildToastContent(item, { hide, id: item.id }),
    [item, hide]
  );
  const measured = useElementLayout(
    true,
    content,
    `panel-${item.id}-content`,
    false
  );
  useEffect(() => {
    if (measured.layout) {
      measure(item.id, measured.layout.height);
    }
  }, [item.id, measured.layout, measure]);
  useEffect(() => () => measure(item.id), [item.id, measure]);
  const depth = useSourceSpring(
    total - 1 - index,
    { dampingRatio: 0.9, duration: 350 },
    reduced
  );
  const arrival = useSourceSpring(
    0,
    { mass: 3 },
    reduced,
    placement === "top" ? -100 : 100
  );
  const swipe = useToastSwipe(
    placement,
    hide,
    reduced,
    departing || depth >= 3 || item.swipeToDismiss === false
  );
  const { offset, scale, active: _active, ...handlers } = swipe;
  const anchor = placement === "top" ? { top: 0 } : { bottom: 0 };
  const height = frontHeight ?? measured.layout?.height;
  const direction = placement === "top" ? 1 : -1;
  const entry =
    placement === "top"
      ? "panelui-toast-enter-top"
      : "panelui-toast-enter-bottom";
  const exit =
    placement === "top"
      ? "panelui-toast-exit-top"
      : "panelui-toast-exit-bottom";
  let animation = departing ? exit : entry;
  if (reduced) {
    animation = departing ? "panelui-toast-fade-out" : "panelui-toast-fade-in";
  }
  return (
    <View
      aria-hidden={departing || depth >= 3}
      className={cn("absolute", animation)}
      style={{
        ...anchor,
        left: "32rpx",
        pointerEvents: departing || depth >= 3 ? "none" : "auto",
        right: "32rpx",
        transform:
          departing || reduced ? undefined : `translateY(${arrival * 2}rpx)`,
        zIndex: index,
      }}
    >
      <View
        {...handlers}
        catchMove={!departing && depth < 3}
        style={{
          height: height === undefined ? undefined : `${height * 2}rpx`,
          opacity: Math.min(1, Math.max(0, 3 - depth)),
          transform: `translateY(${(Math.max(0, depth) * 10 * direction + offset) * 2}rpx) scale(${(1 - Math.max(0, depth) * 0.03) * scale})`,
        }}
      >
        <View id={measured.id} style={{ flexShrink: 0 }}>
          {content}
        </View>
      </View>
    </View>
  );
};
