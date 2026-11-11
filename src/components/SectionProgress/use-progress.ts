import { useCallback, useSyncExternalStore } from "react";

import { useTimingNumber } from "../../hooks/use-timing-number";
import { useScrollProgress } from "../../primitives/scroll-progress";
import type { SectionProgressProps } from "./types";

export const useSectionProgressReading = (
  props: SectionProgressProps,
  reduced: boolean
) => {
  const inherited = useScrollProgress();
  const source = props.scroll ?? inherited;
  const { progress } = props;
  const subscribe = useCallback(
    (listener: () => void) => {
      const sources = [
        source?.offset,
        source?.viewport,
        source?.content,
        typeof progress === "object" ? progress : undefined,
      ];
      const subscriptions = sources.map((signal) =>
        signal?.subscribe(listener)
      );
      return () => {
        for (const unsubscribe of subscriptions) {
          unsubscribe?.();
        }
      };
    },
    [source, progress]
  );
  const read = useCallback(() => {
    const span = source ? source.content.value - source.viewport.value : 0;
    let next = 0;
    if (typeof progress === "number") {
      next = progress;
    } else if (progress) {
      next = progress.value;
    } else if (source && span > 0) {
      next = source.offset.value / span;
    }
    return Math.min(1, Math.max(0, next));
  }, [source, progress]);
  const target = useSyncExternalStore(subscribe, read, read);
  const threshold = props.revealAt ?? 64;
  const readReveal = useCallback(
    () => (source ? source.offset.value >= threshold : true),
    [source, threshold]
  );
  const revealed = useSyncExternalStore(subscribe, readReveal, readReveal);
  const filled = useTimingNumber(target, 160, reduced, 0);
  const shown = useTimingNumber(
    revealed ? 1 : 0,
    200,
    reduced,
    threshold <= 0 ? 1 : 0
  );
  return { filled, percent: Math.round(filled * 20) * 5, revealed, shown };
};
