import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useChartTween } from "../../primitives/chart-tween";
import { morphOrigins } from "./math";
import type { RadarValues } from "./math";

const MORPH_DURATION = 420;
export const useRadarMorph = (values: RadarValues) => {
  const [frames, setFrames] = useState(() => ({ from: values, to: values }));
  const morph = useChartTween(1);
  const reduced = usePanelReducedMotion();
  const settled = useRef(false);
  useEffect(() => {
    if (!settled.current) {
      settled.current = true;
      return;
    }
    if (reduced) {
      setFrames({ from: values, to: values });
      morph.setImmediate(1);
      return;
    }
    const t = morph.signal.value;
    setFrames((current) => ({
      from: morphOrigins(current.from, current.to, t),
      to: values,
    }));
    morph.setImmediate(0);
    morph.timingTo(1, MORPH_DURATION);
  }, [values, reduced, morph.signal, morph.setImmediate, morph.timingTo]);
  const progress = useSyncExternalStore(
    morph.signal.subscribe,
    morph.signal.getSnapshot,
    morph.signal.getSnapshot
  );
  return { ...frames, progress };
};
