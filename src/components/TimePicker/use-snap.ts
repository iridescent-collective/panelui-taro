import type { ScrollViewProps } from "@tarojs/components";
import { nextTick, showActionSheet } from "@tarojs/taro";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useNativeScrollMetrics } from "../../hooks/use-native-scroll-metrics";
import { useScrollCommand } from "../../hooks/use-scroll-command";
import { selectionTick } from "../../lib/haptics";
import { createObservableNumber } from "../../primitives/observable-number";
import { indexForAccessibilityAction } from "./accessibility";

export const useSnap = (
  index: number,
  count: number,
  spacing: number,
  syncToken: number,
  disabled: boolean | undefined,
  onIndexChange: (next: number) => void,
  domain: string
) => {
  const { pixelSpacing, pixelScale } = useNativeScrollMetrics(spacing);
  const signal = useMemo(() => createObservableNumber(index * spacing), []);
  const scrolling = useScrollCommand(spacing === 12);
  const resting = useRef(index);
  const moving = useRef(false);
  const touching = useRef(false);
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revision = useRef(0);
  const currentDomain = useRef(domain);
  const currentSpacing = useRef(pixelSpacing);
  const latest = useRef({
    count,
    disabled,
    domain,
    index,
    onIndexChange,
    pixelSpacing,
    spacing,
  });
  latest.current = {
    count,
    disabled,
    domain,
    index,
    onIndexChange,
    pixelSpacing,
    spacing,
  };
  const cancel = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);
  const snap = useCallback(
    (to: number) => {
      revision.current += 1;
      const request = revision.current;
      resting.current = to;
      signal.value = to * latest.current.spacing;
      const pixels = to * latest.current.pixelSpacing;
      scrolling.scrollTo(
        pixels,
        () => mounted.current && !moving.current && request === revision.current
      );
    },
    [signal, scrolling.scrollTo]
  );
  const finish = useCallback(() => {
    cancel();
    if (touching.current) {
      return;
    }
    const settings = latest.current;
    if (!moving.current || settings.disabled || settings.count <= 0) {
      moving.current = false;
      return;
    }
    const next = Math.min(
      Math.max(Math.round(signal.value / settings.spacing), 0),
      settings.count - 1
    );
    moving.current = false;
    if (next !== resting.current) {
      resting.current = next;
      settings.onIndexChange(next);
      // Native settleAt reports without waiting for the haptic completion.
      void selectionTick();
    }
    if (!mounted.current) {
      return;
    }
    // WeChat has no RN snapToOffsets: align at rest, using the accepted value.
    nextTick(() => {
      if (mounted.current && !moving.current) {
        snap(latest.current.index);
      }
    });
  }, [cancel, signal, snap]);
  const arm = useCallback(() => {
    cancel();
    timer.current = setTimeout(() => {
      void finish();
    }, 80);
  }, [cancel, finish]);
  const release = useCallback(() => {
    touching.current = false;
    arm();
  }, [arm]);
  const abort = useCallback(() => {
    touching.current = false;
    moving.current = false;
    cancel();
    snap(latest.current.index);
  }, [cancel, snap]);
  useEffect(() => {
    if (disabled || domain !== currentDomain.current) {
      currentDomain.current = domain;
      abort();
    }
  }, [disabled, domain, abort]);
  useEffect(() => {
    if (currentSpacing.current !== pixelSpacing) {
      currentSpacing.current = pixelSpacing;
      abort();
    }
  }, [pixelSpacing, abort]);
  useEffect(() => {
    if (index === resting.current) {
      return;
    }
    if (moving.current) {
      return;
    }
    snap(index);
  }, [index, syncToken, count, spacing, snap]);
  useEffect(() => {
    mounted.current = true;
    snap(latest.current.index);
    return () => {
      mounted.current = false;
      revision.current += 1;
      cancel();
    };
  }, [cancel, snap]);
  const onScroll = useCallback<NonNullable<ScrollViewProps["onScroll"]>>(
    (event) => {
      scrolling.acknowledge(
        spacing === 12 ? event.detail.scrollLeft : event.detail.scrollTop
      );
      signal.value =
        ((spacing === 12 ? event.detail.scrollLeft : event.detail.scrollTop) *
          spacing) /
        latest.current.pixelSpacing;
      if (moving.current && !touching.current) {
        arm();
      }
    },
    [signal, spacing, arm, scrolling.acknowledge]
  );
  const start = useCallback(() => {
    if (latest.current.disabled) {
      return;
    }
    cancel();
    scrolling.cancel();
    revision.current += 1;
    touching.current = true;
    moving.current = true;
  }, [cancel, scrolling.cancel]);
  const adjust = useCallback(async () => {
    const initial = latest.current;
    if (initial.disabled) {
      return;
    }
    try {
      const result = await showActionSheet({
        itemList: ["Increase", "Decrease"],
      });
      if (
        !mounted.current ||
        latest.current.disabled ||
        latest.current.index !== initial.index ||
        latest.current.count !== initial.count ||
        latest.current.domain !== initial.domain
      ) {
        return;
      }
      const next = indexForAccessibilityAction(
        initial.index,
        initial.count,
        result.tapIndex === 0 ? "increment" : "decrement"
      );
      if (next !== undefined) {
        latest.current.onIndexChange(next);
      }
    } catch {
      return false;
    }
  }, []);
  const relayout = useCallback(() => {
    if (!moving.current) {
      snap(latest.current.index);
    }
  }, [snap]);
  return {
    abort,
    adjust,
    finish,
    onScroll,
    pixelScale,
    pixelSpacing,
    id: scrolling.id,
    position: scrolling.position,
    relayout,
    release,
    signal,
    snap,
    start,
  };
};
