import { View } from "@tarojs/components";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { Portal } from "../../primitives/portal";
import { acquireToastTimers } from "./lifecycle";
import { ToastSlot } from "./slot";
import { toastStore } from "./toast-store";
import type { ToastItem, ToastPlacement } from "./toast-store";
import { useToastRecords } from "./use-records";

const ToastStack = ({
  items,
  placement,
}: {
  items: readonly ToastItem[];
  placement: ToastPlacement;
}) => {
  const reduced = usePanelReducedMotion();
  const records = useToastRecords(items, reduced);
  const { insets, overlayTop } = useWindowMetrics();
  const [heights, setHeights] = useState<Map<string, number>>(new Map());
  const measure = useCallback((id: string, height?: number) => {
    setHeights((current) => {
      if (current.get(id) === height) {
        return current;
      }
      const next = new Map(current);
      if (height === undefined) {
        next.delete(id);
      } else {
        next.set(id, height);
      }
      return next;
    });
  }, []);
  if (records.length === 0) {
    return null;
  }
  const anchor =
    placement === "top"
      ? { top: `${(overlayTop + 16) * 2}rpx` }
      : { bottom: `${(insets.bottom + 16) * 2}rpx` };
  return (
    <View
      className="absolute right-[0px] left-[0px]"
      style={{ ...anchor, height: 0, pointerEvents: "none" }}
    >
      {records.map((record) => (
        <ToastSlot
          key={record.item.id}
          record={record}
          frontHeight={heights.get(record.frontId)}
          measure={measure}
        />
      ))}
    </View>
  );
};
export const ToastViewport = () => {
  const items = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getSnapshot
  );
  useEffect(acquireToastTimers, []);
  const top = useMemo(
    () => items.filter((item) => item.placement === "top"),
    [items]
  );
  const bottom = useMemo(
    () => items.filter((item) => item.placement !== "top"),
    [items]
  );
  const reduced = usePanelReducedMotion();
  const [present, setPresent] = useState(items.length > 0);
  useEffect(() => {
    if (items.length > 0) {
      setPresent(true);
      return;
    }
    if (!present) {
      return;
    }
    const timer = setTimeout(() => setPresent(false), reduced ? 120 : 240);
    return () => clearTimeout(timer);
  }, [items.length, present, reduced]);
  if (items.length === 0 && !present) {
    return null;
  }
  return (
    <Portal priority="feedback">
      <View style={{ inset: 0, pointerEvents: "none", position: "fixed" }}>
        <ToastStack items={top} placement="top" />
        <ToastStack items={bottom} placement="bottom" />
      </View>
    </Portal>
  );
};
