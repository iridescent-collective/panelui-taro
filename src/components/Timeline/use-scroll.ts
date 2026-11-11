import type { ScrollViewProps } from "@tarojs/components";
import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import { selectionTick } from "../../lib/haptics";
import { createObservableValue } from "../../primitives/observable-value";
import { nearestColumn } from "./geometry";

export const useTimelineScroll = (
  offsets: number[],
  snap: boolean,
  haptics = false,
  onColumnChange?: (index: number) => void
) => {
  const [signal] = useState(() => createObservableValue(0));
  const [requested, setRequested] = useState(0);
  const nearest = useRef(0);
  const touching = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const props = useRef({ haptics, offsets, onColumnChange, snap });
  props.current = { haptics, offsets, onColumnChange, snap };
  const settle = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      if (
        touching.current ||
        !props.current.snap ||
        !props.current.offsets.length
      ) {
        return;
      }
      const index = nearestColumn(signal.value, props.current.offsets);
      const target = props.current.offsets[index] ?? 0;
      setRequested((signal.value * getWindowInfo().windowWidth) / 375);
      queueMicrotask(() =>
        setRequested((target * getWindowInfo().windowWidth) / 375)
      );
    }, 100);
  };
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    []
  );
  const onScroll: NonNullable<ScrollViewProps["onScroll"]> = (event) => {
    signal.value =
      (event.detail.scrollLeft * 375) / getWindowInfo().windowWidth;
    const index = nearestColumn(signal.value, props.current.offsets);
    if (index !== nearest.current) {
      nearest.current = index;
      if (props.current.snap && props.current.haptics) {
        void selectionTick();
      }
      props.current.onColumnChange?.(index);
    }
    if (!touching.current) {
      settle();
    }
  };
  return {
    onScroll,
    onScrollEnd: settle,
    onTouchCancel: () => {
      touching.current = false;
      settle();
    },
    onTouchEnd: () => {
      touching.current = false;
      settle();
    },
    onTouchStart: () => {
      touching.current = true;
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    scrollLeft: requested,
    signal,
  };
};
