import { nextTick } from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";

import { useMotionNumber } from "../../hooks/use-motion-number";
import { impactKnock, selectionTick } from "../../lib/haptics";
import { SLIDE_SPRING } from "./constants";
import { DEFAULT_AUTO_RESET_DELAY } from "./slide-button-track";
import type { SlideButtonProps } from "./types";

export const useSlideState = (props: SlideButtonProps, reduced: boolean) => {
  const [internal, setInternal] = useState(false);
  const completed = props.completed ?? internal;
  const progress = useMotionNumber(0, SLIDE_SPRING);
  const done = useMotionNumber(0, SLIDE_SPRING);
  const latest = useRef({ completed, progress, props, reduced });
  latest.current = { completed, progress, props, reduced };
  const tasks = useRef(new Set<ReturnType<typeof setTimeout>>());
  const mounted = useRef(true);
  const pending = useRef(false);
  const dragging = useRef(false);
  const revision = useRef(0);
  const animate = useCallback((target: number, velocity?: number) => {
    const owner = latest.current;
    if (owner.reduced) {
      owner.progress.timingTo(target, 160);
    } else {
      owner.progress.springTo(target, velocity);
    }
  }, []);
  const restore = useCallback(() => {
    revision.current += 1;
    const request = revision.current;
    nextTick(() => {
      if (
        !mounted.current ||
        request !== revision.current ||
        dragging.current
      ) {
        return;
      }
      pending.current = false;
      animate(latest.current.completed ? 1 : 0);
    });
  }, [animate]);
  const haptic = useCallback((kind: "arm" | "complete") => {
    if (!latest.current.props.haptics) {
      return;
    }
    const timer = setTimeout(async () => {
      tasks.current.delete(timer);
      await (kind === "arm" ? selectionTick() : impactKnock());
    }, 0);
    tasks.current.add(timer);
  }, []);
  const finish = useCallback(() => {
    const owner = latest.current;
    if (owner.completed || owner.props.disabled || pending.current) {
      return;
    }
    pending.current = true;
    setInternal(true);
    owner.props.onCompletedChange?.(true);
    owner.props.onComplete?.();
    haptic("complete");
    if (owner.props.completed !== undefined) {
      restore();
    }
  }, [haptic, restore]);
  const reset = useCallback(() => {
    pending.current = false;
    setInternal(false);
    latest.current.props.onCompletedChange?.(false);
  }, []);
  useEffect(() => {
    if (!dragging.current) {
      animate(completed ? 1 : 0);
    }
    if (completed) {
      if (reduced) {
        done.timingTo(1, 160);
      } else {
        done.springTo(1);
      }
    } else {
      done.timingTo(0, 140);
    }
  }, [completed, reduced, animate, done.springTo, done.timingTo]);
  useEffect(() => {
    if (!props.autoReset || !completed) {
      return;
    }
    const timer = setTimeout(
      reset,
      props.autoResetDelay ?? DEFAULT_AUTO_RESET_DELAY
    );
    return () => clearTimeout(timer);
  }, [props.autoReset, props.autoResetDelay, completed, reset]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      for (const timer of tasks.current) {
        clearTimeout(timer);
      }
      tasks.current.clear();
    };
  }, []);
  const begin = () => {
    const owner = latest.current;
    if (owner.completed || owner.props.disabled || pending.current) {
      return null;
    }
    revision.current += 1;
    dragging.current = true;
    const current = progress.read();
    progress.setImmediate(current);
    return current;
  };
  const release = (committed: boolean, velocity: number) => {
    dragging.current = false;
    animate(committed ? 1 : 0, velocity);
    if (committed) {
      finish();
    }
  };
  const cancel = () => {
    dragging.current = false;
    restore();
  };
  const activate = () => {
    if (
      latest.current.completed ||
      latest.current.props.disabled ||
      pending.current
    ) {
      return;
    }
    dragging.current = false;
    animate(1);
    finish();
  };
  return {
    activate,
    begin,
    cancel,
    completed,
    done: done.signal,
    move: progress.setImmediate,
    progress: progress.signal,
    read: progress.read,
    release,
    tick: () => haptic("arm"),
  };
};
export type SlideState = ReturnType<typeof useSlideState>;
