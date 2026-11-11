import { onAppHide, offAppHide, onAppShow, offAppShow } from "@tarojs/taro";
import { useEffect, useMemo, useRef } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { createObservableValue } from "../../primitives/observable-value";
import { advanceWaveFrame, stillWaveFrame } from "./engine";
import type { WaveEngineOptions, WaveFrame } from "./types";

export const useWaveEngine = (options: WaveEngineOptions) => {
  const signal = useMemo(
    () =>
      createObservableValue<WaveFrame>({
        clock: 0,
        energy: 0,
        nextSample: 0,
        samples: [],
      }),
    []
  );
  const reduced = usePanelReducedMotion();
  const latest = useRef(options);
  latest.current = options;
  const refresh = useRef<() => void>();
  const running = !options.paused && !reduced;
  const active = useRef(running);
  active.current = running;
  const externalSource =
    typeof options.level === "object" ? options.level : null;
  const driven = options.level !== undefined;
  useEffect(() => {
    let disposed = false;
    let hidden = false;
    let revision = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let previous: number | undefined;
    const stop = () => {
      revision += 1;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      previous = undefined;
    };
    const resume = () => {
      stop();
      if (disposed || hidden || !active.current) {
        return;
      }
      const request = revision;
      const draw = () => {
        if (disposed || request !== revision) {
          return;
        }
        const now = Date.now();
        signal.value = advanceWaveFrame(
          signal.value,
          latest.current,
          previous === undefined ? 16 : now - previous
        );
        previous = now;
        if (!disposed && request === revision) {
          timer = setTimeout(draw, 16);
        }
      };
      timer = setTimeout(draw, 16);
    };
    const hide = () => {
      hidden = true;
      stop();
    };
    const show = () => {
      hidden = false;
      resume();
    };
    refresh.current = resume;
    resume();
    onAppHide(hide);
    onAppShow(show);
    return () => {
      disposed = true;
      stop();
      refresh.current = undefined;
      offAppHide(hide);
      offAppShow(show);
    };
  }, [signal]);
  useEffect(() => {
    if (!running) {
      signal.value = stillWaveFrame(signal.value, latest.current);
    }
    refresh.current?.();
  }, [
    running,
    driven,
    options.sensitivity,
    options.history,
    externalSource,
    signal,
  ]);
  return signal;
};
