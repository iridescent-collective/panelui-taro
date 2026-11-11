import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../hooks/use-reduced-motion";
import { useChartTween } from "./chart-tween";

export const SKELETON_FADE = 220;
export interface UseSkeletonHandoffResult {
  mounted: boolean;
  opacity: number;
}
export const useSkeletonHandoffModel = (
  loading: boolean,
  duration = SKELETON_FADE
) => {
  const [mounted, setMounted] = useState(loading);
  const latest = useRef(loading);
  latest.current = loading;
  const tween = useChartTween(loading ? 1 : 0, undefined, (value) => {
    if (value === 0 && !latest.current) {
      setMounted(false);
    }
  });
  const reduced = usePanelReducedMotion();
  useEffect(() => {
    if (loading) {
      tween.setImmediate(1);
      setMounted(true);
      return;
    }
    if (reduced) {
      tween.setImmediate(0);
      setMounted(false);
      return;
    }
    tween.timingTo(0, duration);
  }, [loading, reduced, duration, tween.setImmediate, tween.timingTo]);
  return { mounted, opacity: tween.signal };
};

export const useSkeletonHandoff = (loading: boolean, duration = SKELETON_FADE) => {
  const { mounted, opacity } = useSkeletonHandoffModel(loading, duration);
  const value = useSyncExternalStore(opacity.subscribe, opacity.getSnapshot, opacity.getSnapshot);
  return { mounted, opacity: value };
};
