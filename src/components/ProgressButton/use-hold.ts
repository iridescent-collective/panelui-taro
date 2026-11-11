import { useCallback, useEffect, useRef, useState } from "react";

import { impactKnock, selectionTick } from "../../lib/haptics";
import { createObservableNumber } from "../../primitives/observable-number";
import {
  DEFAULT_AUTO_RESET_DELAY,
  fillDuration,
  releaseDuration,
  resolveHoldDuration,
} from "./progress-button-hold";
import type { ProgressButtonProps } from "./types";

export const holdFrame = (
  from: number,
  target: number,
  elapsed: number,
  duration: number,
  reduced: boolean
) => {
  const phase = Math.min(1, Math.max(0, elapsed / duration));
  const fraction = reduced ? Math.floor(phase * 5) / 5 : phase;
  return from + (target - from) * fraction;
};
export const useHold = (
  props: ProgressButtonProps,
  reduced: boolean,
  ready: boolean
) => {
  const [progress] = useState(() => createObservableNumber(0));
  const [internal, setInternal] = useState(false);
  const completed = props.completed ?? internal;
  const duration = resolveHoldDuration(props.holdDuration);
  const owner = useRef({ completed, duration, props, ready, reduced });
  owner.current = { completed, duration, props, ready, reduced };
  const frame = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hapticTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const revision = useRef(0);
  const stop = useCallback(() => {
    revision.current += 1;
    if (frame.current !== null) {
      clearTimeout(frame.current);
      frame.current = null;
    }
  }, []);
  const tick = useCallback((complete: boolean) => {
    if (hapticTimer.current !== null) {
      clearTimeout(hapticTimer.current);
    }
    hapticTimer.current = setTimeout(async () => {
      hapticTimer.current = null;
      if (!mounted.current) {
        return;
      }
      await (complete ? impactKnock() : selectionTick());
    }, 0);
  }, []);
  useEffect(() => {
    let full = progress.value >= 1;
    return progress.subscribe(() => {
      const next = progress.value >= 1;
      if (next && !full) {
        full = next;
        const { current } = owner;
        if (
          !mounted.current ||
          current.completed ||
          current.props.disabled ||
          !current.ready
        ) {
          return;
        }
        if (current.props.completed === undefined) {
          current.completed = true;
          setInternal(true);
        }
        current.props.onCompletedChange?.(true);
        current.props.onComplete?.();
        if (current.props.haptics) {
          tick(true);
        }
      } else {
        full = next;
      }
    });
  }, [progress, tick]);
  const animate = useCallback(
    (target: number) => {
      stop();
      const { current } = owner;
      const from = progress.value;
      if (from === target) {
        return;
      }
      const request = revision.current;
      const length =
        target === 1
          ? fillDuration(from, current.duration)
          : releaseDuration(from, current.duration);
      const started = Date.now();
      const render = () => {
        if (!mounted.current || request !== revision.current) {
          return;
        }
        const elapsed = Date.now() - started;
        progress.value = holdFrame(
          from,
          target,
          elapsed,
          length,
          current.reduced
        );
        if (request !== revision.current || !mounted.current) {
          return;
        }
        if (elapsed >= length) {
          frame.current = null;
          return;
        }
        frame.current = setTimeout(render, Math.min(16, length - elapsed));
      };
      frame.current = setTimeout(render, Math.min(16, length));
    },
    [progress, stop]
  );
  const rewind = useCallback(() => animate(0), [animate]);
  const begin = useCallback(() => {
    const { current } = owner;
    if (current.props.disabled || current.completed || !current.ready) {
      return false;
    }
    if (current.props.haptics) {
      tick(false);
    }
    if (progress.value >= 1) {
      return false;
    }
    animate(1);
    return true;
  }, [animate, progress, tick]);
  const abandon = useCallback(() => {
    if (!owner.current.completed) {
      rewind();
    }
  }, [rewind]);
  useEffect(() => {
    if (completed) {
      stop();
      progress.value = 1;
    } else {
      rewind();
    }
  }, [completed, duration, reduced, progress, rewind, stop]);
  useEffect(() => {
    if (!completed || !props.autoReset) {
      return;
    }
    resetTimer.current = setTimeout(() => {
      resetTimer.current = null;
      const { current } = owner;
      if (current.props.completed === undefined) {
        current.completed = false;
        setInternal(false);
        rewind();
      }
      current.props.onCompletedChange?.(false);
    }, props.autoResetDelay ?? DEFAULT_AUTO_RESET_DELAY);
    return () => {
      if (resetTimer.current !== null) {
        clearTimeout(resetTimer.current);
        resetTimer.current = null;
      }
    };
  }, [completed, props.autoReset, props.autoResetDelay, rewind]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stop();
      for (const timer of [resetTimer, hapticTimer]) {
        if (timer.current !== null) {
          clearTimeout(timer.current);
        }
      }
    };
  }, [stop]);
  return { abandon, begin, completed, duration, progress, stop };
};
export type HoldState = ReturnType<typeof useHold>;
