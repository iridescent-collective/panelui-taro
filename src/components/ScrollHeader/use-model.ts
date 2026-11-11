import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useMotionNumber } from "../../hooks/use-motion-number";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { createObservableNumber } from "../../primitives/observable-number";
import {
  collapseProgress,
  HANDOVER_DURATION,
  hasSpan,
  isCrossing,
} from "./math";
import type { ScrollHeaderProps } from "./types";

export const useScrollHeaderModel = (props: ScrollHeaderProps) => {
  const offset = useMemo(() => createObservableNumber(0), []);
  const largeHeight = useMemo(() => createObservableNumber(0), []);
  const progress = useMotionNumber(0, {});
  const reduced = usePanelReducedMotion();
  const [largeSize, setLargeSize] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const previous = useRef<boolean | null>(null);
  const target = useRef(0);
  const latest = useRef({ progress, props, reduced });
  latest.current = { progress, props, reduced };
  const measureLarge = useCallback(
    (height: number) => {
      largeHeight.value = height;
      setLargeSize((value) =>
        Math.abs(value - height) < 0.5 ? value : height
      );
    },
    [largeHeight]
  );
  useEffect(() => {
    const update = () => {
      const { current } = latest;
      const next = collapseProgress(
        offset.value,
        largeHeight.value,
        current.props.threshold ?? 1
      );
      if (hasSpan(largeHeight.value) || current.reduced) {
        current.progress.setImmediate(next);
      } else if (next !== target.current) {
        current.progress.timingTo(next, HANDOVER_DURATION);
      }
      target.current = next;
    };
    const offOffset = offset.subscribe(update);
    const offHeight = largeHeight.subscribe(update);
    update();
    return () => {
      offOffset();
      offHeight();
    };
  }, [offset, largeHeight, props.threshold, reduced]);
  useEffect(() => {
    const publish = () => {
      const next = progress.signal.value >= 1;
      if (isCrossing(next, previous.current)) {
        setCollapsed(next);
        latest.current.props.onCollapsedChange?.(next);
      }
      previous.current = next;
      const external = latest.current.props.progress;
      if (external && external !== progress.signal) {
        external.value = progress.signal.value;
      }
    };
    publish();
    return progress.signal.subscribe(publish);
  }, [progress.signal, props.progress]);
  return {
    collapsed,
    largeHeight,
    largeSize,
    measureLarge,
    offset,
    progress: progress.signal,
    reduced,
  };
};
