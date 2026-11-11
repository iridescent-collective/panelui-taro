import { useEffect, useState, useSyncExternalStore } from "react";

import { createObservableNumber } from "../primitives/observable-number";
import type { ObservableNumber } from "../primitives/observable-number";
import { useScrollProgress } from "../primitives/scroll-progress";
import { useElementLayout } from "./use-element-layout";
import { useWindowMetrics } from "./use-window-metrics";

export interface UseRevealProgressOptions {
  start?: number;
  end?: number;
  progress?: ObservableNumber;
  enabled?: boolean;
  id?: string;
}
export const revealFraction = (
  top: number,
  height: number,
  viewport: number,
  start: number,
  end: number
) => {
  if (viewport <= 0 || height <= 0) {
    return 0;
  }
  const from = start * viewport;
  const to = end * viewport - height;
  const span = from - to;
  if (span <= 0) {
    return top <= to ? 1 : 0;
  }
  return Math.min(1, Math.max(0, (from - top) / span));
};
export const useRevealProgress = ({
  start = 0.9,
  end = 0.5,
  progress: external,
  enabled = true,
  id,
}: UseRevealProgressOptions = {}) => {
  const scroll = useScrollProgress();
  const window = useWindowMetrics();
  const [derived] = useState(() => createObservableNumber());
  const measurement = useElementLayout(enabled && !external, undefined, id);
  useEffect(() => {
    if (external) {
      return;
    }
    if (!enabled) {
      derived.value = 1;
      return;
    }
    let mounted = true;
    let request = 0;
    const refresh = () => {
      request += 1;
      const current = request;
      measurement.refresh(
        () => mounted && current === request,
        (rect) => {
          derived.value = rect
            ? revealFraction(
                rect.top - (scroll?.top.value ?? 0),
                rect.height,
                scroll?.viewport.value || window.height,
                start,
                end
              )
            : 0;
        }
      );
    };
    refresh();
    const releases = scroll
      ? [
          scroll.offset.subscribe(refresh),
          scroll.viewport.subscribe(refresh),
          scroll.top.subscribe(refresh),
          scroll.content.subscribe(refresh),
        ]
      : [];
    return () => {
      mounted = false;
      for (const release of releases) {
        release();
      }
    };
  }, [
    derived,
    enabled,
    end,
    external,
    measurement.refresh,
    measurement.layout,
    scroll,
    start,
    window.height,
  ]);
  const progress = external ?? derived;
  const value = useSyncExternalStore(
    progress.subscribe,
    progress.getSnapshot,
    progress.getSnapshot
  );
  return { id: measurement.id, progress, value };
};
