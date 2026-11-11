import { useEffect, useRef } from "react";

import { normalizeCarouselIndex } from "./math";

interface CarouselIndexLifecycleOptions {
  requestedIndex: number;
  count: number;
  countKnown: boolean;
  loop: boolean;
  onCorrection: (index: number) => void;
  onSettledIndex: (index: number) => void;
}
export const useCarouselIndexLifecycle = ({
  requestedIndex,
  count,
  countKnown,
  loop,
  onCorrection,
  onSettledIndex,
}: CarouselIndexLifecycleOptions): number => {
  const index = countKnown
    ? normalizeCarouselIndex(requestedIndex, count, loop)
    : requestedIndex;
  const reportedCorrection = useRef<string | null>(null);
  useEffect(() => {
    if (!countKnown) {
      return;
    }
    onSettledIndex(index);
    if (index === requestedIndex) {
      reportedCorrection.current = null;
      return;
    }
    const correction = `${requestedIndex}:${count}:${loop}`;
    if (reportedCorrection.current === correction) {
      return;
    }
    reportedCorrection.current = correction;
    onCorrection(index);
  }, [
    count,
    countKnown,
    index,
    loop,
    onCorrection,
    onSettledIndex,
    requestedIndex,
  ]);
  return index;
};
interface CarouselAutoplayOptions {
  enabled: boolean;
  index: number;
  count: number;
  loop: boolean;
  interval: number;
  onAdvance: (index: number) => void;
}
export const useCarouselAutoplay = ({
  enabled,
  index,
  count,
  loop,
  interval,
  onAdvance,
}: CarouselAutoplayOptions): void => {
  useEffect(() => {
    if (!enabled || count <= 1 || (!loop && index >= count - 1)) {
      return;
    }
    const timer = setTimeout(() => onAdvance(index + 1), interval);
    return () => clearTimeout(timer);
  }, [count, enabled, index, interval, loop, onAdvance]);
};
