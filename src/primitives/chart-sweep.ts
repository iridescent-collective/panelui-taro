import { useEffect, useRef, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../hooks/use-reduced-motion";
import { chartLinear, useChartTween } from "./chart-tween";

export const useChartSweep = (loading: boolean, duration: number) => {
  const reduced = usePanelReducedMotion();
  const tweenRef = useRef<ReturnType<typeof useChartTween> | null>(null);
  const tween = useChartTween(0, chartLinear, (value) => {
    if (
      value === 1 &&
      loading &&
      !reduced &&
      Number.isFinite(duration) &&
      duration > 0
    ) {
      tweenRef.current?.setImmediate(0);
      tweenRef.current?.timingTo(1, duration);
    }
  });
  tweenRef.current = tween;
  const sweep = useSyncExternalStore(
    tween.signal.subscribe,
    tween.signal.getSnapshot,
    tween.signal.getSnapshot
  );
  useEffect(() => {
    tween.setImmediate(0);
    if (loading && !reduced && Number.isFinite(duration) && duration > 0) {
      tween.timingTo(1, duration);
    }
    return tween.stop;
  }, [
    loading,
    reduced,
    duration,
    tween.setImmediate,
    tween.timingTo,
    tween.stop,
  ]);
  return sweep;
};
