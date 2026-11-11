import { nextTick } from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";

import { clampRatio } from "./context";
import type { CompareProps } from "./types";

export const useCompareState = ({
  value,
  defaultValue = 0.5,
  onValueChange,
  onValueCommit,
}: CompareProps) => {
  const [internal, setInternal] = useState(defaultValue);
  const settled = clampRatio(value ?? internal);
  const [ratio, setRatio] = useState(settled);
  const live = useRef(ratio);
  const dragging = useRef(false);
  const latest = useRef({ onValueChange, onValueCommit, settled, value });
  latest.current = { onValueChange, onValueCommit, settled, value };
  const mounted = useRef(true);
  const revision = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const update = useCallback((next: number) => {
    live.current = next;
    setRatio(next);
  }, []);
  useEffect(() => {
    if (!dragging.current) {
      update(settled);
    }
  }, [settled, update]);
  const restore = () => {
    revision.current += 1;
    const requested = revision.current;
    nextTick(() => {
      if (
        mounted.current &&
        requested === revision.current &&
        !dragging.current &&
        latest.current.value !== undefined
      ) {
        update(latest.current.settled);
      }
    });
  };
  const finish = () => {
    dragging.current = false;
    const next = live.current;
    if (latest.current.value === undefined) {
      setInternal(next);
    }
    latest.current.onValueCommit?.(next);
    restore();
  };
  const cancel = () => {
    revision.current += 1;
    dragging.current = false;
    update(latest.current.settled);
  };
  const begin = () => {
    revision.current += 1;
    dragging.current = true;
    return live.current;
  };
  const report = (next: number) => latest.current.onValueChange?.(next);
  const nudge = (delta: number) => {
    if (dragging.current) {
      cancel();
    }
    const next = clampRatio(live.current + delta);
    update(next);
    if (latest.current.value === undefined) {
      setInternal(next);
    }
    report(next);
    latest.current.onValueCommit?.(next);
    restore();
  };
  return {
    begin,
    cancel,
    finish,
    nudge,
    ratio,
    read: () => live.current,
    report,
    update,
  };
};
export type CompareState = ReturnType<typeof useCompareState>;
