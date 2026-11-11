import { onKeyboardHeightChange, offKeyboardHeightChange } from "@tarojs/taro";
import { createObservableValue } from "panelui-taro/primitives/observable-value";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type { ComponentType } from "react";

import { View, ScrollView, FlatList } from "./native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "./native";

const listeners = new Set<() => void>();
let revision = 0;
const notify = () => {
  revision += 1;
  for (const listener of listeners) {
    listener();
  }
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
type Signal<T> = ReturnType<typeof createObservableValue<T>>;
const timers = new WeakMap<object, ReturnType<typeof setTimeout>>();
type Animation = {
  to: number;
  duration: number;
  done?: (finished: boolean) => void;
  easing?: (n: number) => number;
  motion: true;
};
export const cancelAnimation = (signal: object) => {
  const timer = timers.get(signal);
  if (timer) {
    clearTimeout(timer);
  }
  timers.delete(signal);
};
export const useSharedValue = <T,>(initial: T): Signal<T> => {
  const signal = useMemo(() => {
    const value = createObservableValue(initial);
    const state = { ...value };
    Object.defineProperty(state, "value", {
      get: () => value.value,
      set: (next: T | Animation) => {
        cancelAnimation(state);
        if (next && typeof next === "object" && "motion" in next) {
          const animation = next as Animation;
          const from = Number(value.value);
          const start = Date.now();
          const tick = () => {
            const t = Math.min(
              1,
              (Date.now() - start) / Math.max(1, animation.duration)
            );
            value.value = (from +
              (animation.to - from) * (animation.easing?.(t) ?? t)) as T;
            notify();
            if (t < 1) {
              timers.set(state, setTimeout(tick, 16));
            } else {
              timers.delete(state);
              animation.done?.(true);
            }
          };
          tick();
        } else {
          value.value = next as T;
          notify();
        }
      },
    });
    return state;
  }, []);
  useEffect(() => () => cancelAnimation(signal), [signal]);
  return signal;
};
export const withTiming = (
  to: number,
  config?: { duration?: number; easing?: (n: number) => number },
  done?: (finished: boolean) => void
): number =>
  ({
    done,
    duration: config?.duration ?? 300,
    easing: config?.easing,
    motion: true,
    to,
  }) as unknown as number;
export const withSpring = (to: number, _config?: object) =>
  withTiming(to, { duration: 300, easing: (t) => 1 - (1 - t) ** 3 });
export const runOnJS = <T extends (...args: never[]) => unknown>(fn: T): T =>
  fn;
export const Easing = {
  cubic: (n: number) => n * n * n,
  linear: (n: number) => n,
  out: (fn: (n: number) => number) => (n: number) => 1 - fn(1 - n),
  quad: (n: number) => n * n,
};
export const useAnimatedStyle = <T,>(compute: () => T): T => {
  useSyncExternalStore(subscribe, () => revision);
  return compute();
};
export const useAnimatedProps = useAnimatedStyle;
export const useAnimatedRef = <T,>() => useRef<T>(null);
export const useAnimatedScrollHandler =
  (handler: (event: NativeScrollEvent) => void) =>
  (event: NativeSyntheticEvent<NativeScrollEvent>) =>
    handler(event.nativeEvent);
export const useAnimatedKeyboard = () => {
  const height = useSharedValue(0);
  useEffect(() => {
    const update = (event: { height: number }) => {
      height.value = event.height;
    };
    onKeyboardHeightChange(update);
    return () => offKeyboardHeightChange(update);
  }, [height]);
  return { height };
};
export const interpolate = (
  value: number,
  input: number[],
  output: number[],
  _clamp?: string
) => {
  const i = Math.max(0, input.findIndex((v) => value <= v) - 1);
  const index = value >= (input.at(-1) ?? 0) ? input.length - 2 : i;
  const t = Math.max(
    0,
    Math.min(1, (value - input[index]) / (input[index + 1] - input[index]))
  );
  return output[index] + t * (output[index + 1] - output[index]);
};
interface Transition {
  name: string;
  milliseconds: number;
  damping: (value: number) => Transition;
  duration: (value: number) => Transition;
  mass: (value: number) => Transition;
  springify: () => Transition;
  stiffness: (value: number) => Transition;
}
const transition = (name: string, milliseconds = 240): Transition => ({
  damping: () => transition(name, milliseconds),
  duration: (value) => transition(name, value),
  mass: () => transition(name, milliseconds),
  milliseconds,
  name,
  springify: () => transition(name, milliseconds),
  stiffness: () => transition(name, milliseconds),
});
export const LinearTransition = transition("layout");
export { usePanelReducedMotion as useReducedMotion } from "panelui-taro/provider";
export const FadeInDown = transition("official-fade-in-down");
export const FadeOutDown = transition("official-fade-out-down");
export const ZoomIn = transition("official-zoom-in");
const Animated = {
  FlatList,
  ScrollView,
  View,
  createAnimatedComponent:
    <P extends object>(Component: ComponentType<P>) =>
    (props: P & { animatedProps?: Partial<P> }) => {
      const { animatedProps, ...rest } = props;
      return <Component {...(rest as P)} {...animatedProps} />;
    },
};
export default Animated;
