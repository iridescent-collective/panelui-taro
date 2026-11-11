import { useSyncExternalStore } from "react";

import { useScrollProgress } from "../primitives/scroll-progress";

export const useScrollEdgeOpacities = (distance: number) => {
  const scroll = useScrollProgress();
  if (!scroll) {
    throw new Error("Scroll edge indicators require ScrollProgress");
  }
  const offset = useSyncExternalStore(
    scroll.offset.subscribe,
    scroll.offset.getSnapshot,
    scroll.offset.getSnapshot
  );
  const viewport = useSyncExternalStore(
    scroll.viewport.subscribe,
    scroll.viewport.getSnapshot,
    scroll.viewport.getSnapshot
  );
  const content = useSyncExternalStore(
    scroll.content.subscribe,
    scroll.content.getSnapshot,
    scroll.content.getSnapshot
  );
  const divisor = distance > 0 ? distance : Number.EPSILON;
  return {
    end: Math.min(Math.max(content - viewport - offset, 0) / divisor, 1),
    start: Math.min(Math.max(offset, 0) / divisor, 1),
  };
};
