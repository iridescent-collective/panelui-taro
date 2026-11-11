import { showActionSheet } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import type { HsvaColor } from "../../lib/color";
import { useChartTween } from "../../primitives/chart-tween";
import { useColorPicker } from "./context";

interface Nudge {
  key: keyof HsvaColor;
  delta: number;
  label: string;
  wrap?: boolean;
}
export const useColorNudge = (actions: readonly Nudge[]) => {
  const ctx = useColorPicker();
  const reduced = usePanelReducedMotion();
  const motion = useRef<{
    from: HsvaColor;
    target: HsvaColor;
  } | null>(null);
  const written = useRef<HsvaColor | null>(null);
  const current = useRef(ctx);
  current.current = ctx;
  const timer = useChartTween(1, undefined, (value) => {
    const next = motion.current;
    if (!next) {
      return;
    }
    if (written.current !== current.current.signal.value) {
      motion.current = null;
      return;
    }
    const blend = (key: keyof HsvaColor) =>
      next.from[key] + (next.target[key] - next.from[key]) * value;
    const frame = {
      a: blend("a"),
      h: blend("h"),
      s: blend("s"),
      v: blend("v"),
    };
    written.current = frame;
    current.current.signal.value = frame;
  });
  const mounted = useRef(true);
  const version = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      version.current += 1;
    };
  }, []);
  return async () => {
    if (current.current.disabled) {
      return;
    }
    version.current += 1;
    const request = version.current;
    const original = current.current.signal.value;
    try {
      const answer = await showActionSheet({
        itemList: actions.map((action) => action.label),
      });
      if (
        !mounted.current ||
        version.current !== request ||
        current.current.disabled ||
        current.current.signal.value !== original
      ) {
        return;
      }
      const action = actions[answer.tapIndex];
      if (!action) {
        return;
      }
      const maximum = action.key === "h" ? 360 : 1;
      let value = original[action.key] + action.delta;
      value = action.wrap
        ? (value + 360) % 360
        : Math.min(maximum, Math.max(0, value));
      const target = { ...original, [action.key]: value };
      current.current.emit(target, true);
      if (action.wrap || reduced) {
        return;
      }
      written.current = target;
      motion.current = { from: original, target };
      timer.setImmediate(0);
      timer.timingTo(1, 140);
    } catch {
      return false;
    }
  };
};
export const AREA_NUDGES = [
  { delta: 0.05, key: "s", label: "More saturated" },
  { delta: -0.05, key: "s", label: "Less saturated" },
  { delta: 0.05, key: "v", label: "Brighter" },
  { delta: -0.05, key: "v", label: "Darker" },
] as const;
export const WHEEL_NUDGES = [
  { delta: 10, key: "h", label: "Next hue", wrap: true },
  { delta: -10, key: "h", label: "Previous hue", wrap: true },
  { delta: 0.05, key: "s", label: "More saturated" },
  { delta: -0.05, key: "s", label: "Less saturated" },
] as const;
