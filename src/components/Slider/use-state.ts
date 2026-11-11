import { nextTick } from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";

import { useSpringNumber } from "../../hooks/use-spring-number";
import { selectionTick } from "../../lib/haptics";
import {
  clampSlider,
  sliderFraction,
  snapSlider,
  SLIDER_SPRING,
  KNOB_SPRING,
} from "./math";
import type { SliderProps, SliderThumb } from "./types";

export const useSliderState = (props: SliderProps, reduced: boolean) => {
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const step = props.step ?? 1;
  const isRange = props.range !== undefined || props.defaultRange !== undefined;
  const [internal, setInternal] = useState(props.defaultValue ?? 0);
  const [internalRange, setInternalRange] = useState<[number, number]>(
    props.defaultRange ?? [min, max]
  );
  const value = clampSlider(props.value ?? internal, min, max);
  const rawRange = props.range ?? internalRange;
  const low = clampSlider(Math.min(...rawRange), min, max);
  const high = clampSlider(Math.max(...rawRange), min, max);
  const fraction = useCallback(
    (n: number) => sliderFraction(n, min, max),
    [min, max]
  );
  const lowMotion = useSpringNumber(
    isRange ? fraction(low) : 0,
    SLIDER_SPRING,
    reduced,
    undefined,
    false
  );
  const highMotion = useSpringNumber(
    fraction(isRange ? high : value),
    SLIDER_SPRING,
    reduced,
    undefined,
    false
  );
  const [pressed, setPressed] = useState<SliderThumb | null>(null);
  const lowKnob = useSpringNumber(
    pressed === "low" ? 1 : 0,
    KNOB_SPRING,
    reduced
  );
  const highKnob = useSpringNumber(
    pressed === "high" ? 1 : 0,
    KNOB_SPRING,
    reduced
  );
  const dragging = useRef(false);
  const lastTick = useRef({ high: isRange ? high : value, low });
  const tasks = useRef(new Set<ReturnType<typeof setTimeout>>());
  const mounted = useRef(true);
  const revision = useRef(0);
  const latest = useRef({
    high,
    highMotion,
    isRange,
    low,
    lowMotion,
    max,
    min,
    props,
    step,
    value,
  });
  latest.current = {
    high,
    highMotion,
    isRange,
    low,
    lowMotion,
    max,
    min,
    props,
    step,
    value,
  };
  const tick = useCallback(() => {
    const timer = setTimeout(async () => {
      tasks.current.delete(timer);
      await selectionTick();
    }, 0);
    tasks.current.add(timer);
  }, []);
  useEffect(() => {
    if (dragging.current) {
      return;
    }
    lowMotion.springTo(isRange ? fraction(low) : 0);
    highMotion.springTo(fraction(isRange ? high : value));
  }, [
    value,
    low,
    high,
    isRange,
    fraction,
    lowMotion.springTo,
    highMotion.springTo,
  ]);
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
      const owner = latest.current;
      owner.lowMotion.springTo(
        owner.isRange ? sliderFraction(owner.low, owner.min, owner.max) : 0
      );
      owner.highMotion.springTo(
        sliderFraction(
          owner.isRange ? owner.high : owner.value,
          owner.min,
          owner.max
        )
      );
    });
  }, []);
  const report = useCallback(
    (pLow: number, pHigh: number, commit: boolean, thumb: SliderThumb) => {
      const owner = latest.current;
      const span = owner.max > owner.min ? owner.max - owner.min : 1;
      const pair: [number, number] = [
        snapSlider(owner.min + pLow * span, owner.min, owner.max, owner.step),
        snapSlider(owner.min + pHigh * span, owner.min, owner.max, owner.step),
      ];
      const next = thumb === "low" ? pair[0] : pair[1];
      if (owner.props.haptics && lastTick.current[thumb] !== next) {
        lastTick.current[thumb] = next;
        tick();
      }
      if (owner.isRange) {
        if (owner.props.range === undefined) {
          setInternalRange(pair);
        }
        owner.props.onRangeChange?.(pair);
        if (commit) {
          owner.props.onRangeCommit?.(pair);
        }
      } else {
        if (owner.props.value === undefined) {
          setInternal(pair[1]);
        }
        owner.props.onValueChange?.(pair[1]);
        if (commit) {
          owner.props.onValueCommit?.(pair[1]);
        }
      }
    },
    [tick]
  );
  const begin = (thumb: SliderThumb) => {
    revision.current += 1;
    dragging.current = true;
    lowMotion.setImmediate(lowMotion.read());
    highMotion.setImmediate(highMotion.read());
    setPressed(thumb);
    return { high: highMotion.read(), low: lowMotion.read() };
  };
  const move = (pLow: number, pHigh: number, thumb: SliderThumb) => {
    lowMotion.setImmediate(pLow);
    highMotion.setImmediate(pHigh);
    report(pLow, pHigh, false, thumb);
  };
  const finish = (thumb: SliderThumb) => {
    dragging.current = false;
    setPressed(null);
    report(lowMotion.read(), highMotion.read(), true, thumb);
    restore();
  };
  const cancel = () => {
    dragging.current = false;
    setPressed(null);
    restore();
  };
  const tap = (pLow: number, pHigh: number, thumb: SliderThumb) => {
    dragging.current = false;
    setPressed(null);
    lowMotion.springTo(pLow);
    highMotion.springTo(pHigh);
    report(pLow, pHigh, true, thumb);
    restore();
  };
  const nudge = (direction: 1 | -1, thumb: SliderThumb) => {
    const owner = latest.current;
    if (owner.props.disabled) {
      return;
    }
    const gap = (owner.props.minStepsBetweenThumbs ?? 0) * owner.step;
    const maximum = owner.isRange ? owner.high : owner.value;
    const current = thumb === "low" ? owner.low : maximum;
    const raw = current + direction * (owner.step || 1);
    const bounded = owner.isRange
      ? clampSlider(
          raw,
          thumb === "low" ? owner.min : owner.low + gap,
          thumb === "low" ? owner.high - gap : owner.max
        )
      : raw;
    const next = snapSlider(bounded, owner.min, owner.max, owner.step);
    if (next === current) {
      return;
    }
    const lowFraction = sliderFraction(owner.low, owner.min, owner.max);
    const highFraction = sliderFraction(owner.high, owner.min, owner.max);
    const pickedFraction = sliderFraction(next, owner.min, owner.max);
    const nextLow = thumb === "low" ? pickedFraction : lowFraction;
    const nextHigh = thumb === "high" ? pickedFraction : highFraction;
    tap(owner.isRange ? nextLow : 0, nextHigh, thumb);
  };
  const nativeChange = (next: number, commit: boolean) => {
    const owner = latest.current;
    if (owner.props.disabled) {
      return;
    }
    const accepted = snapSlider(next, owner.min, owner.max, owner.step);
    if (owner.props.value === undefined) {
      setInternal(accepted);
    }
    owner.props.onValueChange?.(accepted);
    if (commit) {
      owner.props.onValueCommit?.(accepted);
    }
  };
  return {
    begin,
    cancel,
    finish,
    high,
    highKnob: highKnob.value,
    highProgress: highMotion.value,
    isRange,
    low,
    lowKnob: lowKnob.value,
    lowProgress: lowMotion.value,
    max,
    min,
    move,
    nativeChange,
    nudge,
    read: () => ({ high: highMotion.read(), low: lowMotion.read() }),
    step,
    tap,
    value,
  };
};
export type SliderState = ReturnType<typeof useSliderState>;
