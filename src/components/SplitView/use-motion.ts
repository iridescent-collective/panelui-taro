import { useCallback, useEffect, useRef, useState } from "react";

import { useSpringNumber } from "../../hooks/use-spring-number";
import { createObservableNumber } from "../../primitives/observable-number";
import { createObservableValue } from "../../primitives/observable-value";
import { SPLIT_SPRING } from "./constants";
import { useSplitViewIndexLifecycle } from "./split-view-lifecycle";
import type { SplitViewProps } from "./types";

export const useSplitMotion = (
  props: SplitViewProps,
  points: number[],
  animate: boolean
) => {
  const {
    index: snapIndex,
    requestIndex,
    requestToken,
  } = useSplitViewIndexLifecycle({
    count: points.length,
    defaultSnapIndex: props.defaultSnapIndex ?? 1,
    onSnapIndexChange: props.onSnapIndexChange,
    snapIndex: props.snapIndex,
  });
  const [topHeight] = useState(() => createObservableNumber(0));
  const [dragging] = useState(() => createObservableValue(false));
  const publish = useCallback(
    (height: number) => {
      topHeight.value = height;
    },
    [topHeight]
  );
  const { setImmediate, springTo } = useSpringNumber(
    0,
    SPLIT_SPRING,
    !animate,
    publish,
    false
  );
  const onSnap = useRef(props.onSnap);
  onSnap.current = props.onSnap;
  const report = useCallback(
    (index: number, height: number) => onSnap.current?.(index, height),
    []
  );
  const settled = useRef(false);
  const snapTo = useCallback(
    (index: number) => {
      if (points[index] !== undefined) {
        requestIndex(index);
      }
    },
    [points, requestIndex]
  );
  const finishAt = useCallback(
    (index: number, target: number) => {
      springTo(target, undefined, (finished) => {
        if (finished) {
          report(index, target);
        }
      });
    },
    [springTo, report]
  );
  const animateOnMount = props.animateOnMount ?? false;
  useEffect(() => {
    const target = points[snapIndex];
    if (target === undefined || dragging.value) {
      return;
    }
    if (!settled.current) {
      settled.current = true;
      if (!animateOnMount) {
        setImmediate(target);
        report(snapIndex, target);
        return;
      }
    }
    finishAt(snapIndex, target);
  }, [
    points,
    snapIndex,
    animate,
    animateOnMount,
    requestToken,
    dragging,
    setImmediate,
    report,
    finishAt,
  ]);
  const cancel = useCallback(() => {
    dragging.value = false;
    const target = points[snapIndex];
    if (target !== undefined) {
      finishAt(snapIndex, target);
    }
  }, [dragging, points, snapIndex, finishAt]);
  return {
    cancel,
    dragging,
    snapIndex,
    snapTo,
    topHeight,
    writeHeight: setImmediate,
  };
};
