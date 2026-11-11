import { View } from "@tarojs/components";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import { cn } from "../../lib/utils";
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import type { ThemeToken } from "../../theme/types";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { useShared, useStill } from "./context";
import { scrollingValues, withAlpha } from "./math";
import type { TextAnimationScrollingProps } from "./types";
import { useFormatter } from "./use-formatter";
import { textAnimationVariants } from "./variants";

export const TextAnimationScrolling = ({
  className,
  value,
  step = 1,
  around = 2,
  duration,
  delay,
  formatOptions,
  textClassName,
  size,
  weight,
  highlight = false,
  highlightClassName,
  fadeColor = "--color-background",
  enabled,
  ...props
}: TextAnimationScrollingProps) => {
  const span = useShared("duration", duration, 1400);
  const wait = useShared("delay", delay, 0);
  const still = useStill(useShared("enabled", enabled, true));
  const token = useThemeToken(
    typeof fadeColor === "string" && fadeColor.startsWith("--color-")
      ? (fadeColor.slice(8) as ThemeToken)
      : "background"
  );
  let fade: string | undefined;
  if (fadeColor !== false) {
    fade = fadeColor.startsWith("--") ? token : fadeColor;
  }
  const format = useFormatter(0, formatOptions);
  const { values, target, rows } = useMemo(
    () => scrollingValues(value, step, around),
    [around, step, value]
  );
  let placeholder = format(value);
  for (const entry of values) {
    const formatted = format(entry);
    if (formatted.length > placeholder.length) {
      placeholder = formatted;
    }
  }
  const tween = useChartTween(still ? target : 0, chartCubicOut);
  const offset = useSyncExternalStore(
    tween.signal.subscribe,
    tween.signal.getSnapshot,
    tween.signal.getSnapshot
  );
  useEffect(() => {
    tween.setImmediate(still ? target : 0);
    if (still) {
      return;
    }
    const timer = setTimeout(() => tween.timingTo(target, span), wait);
    return () => {
      clearTimeout(timer);
      tween.stop();
    };
  }, [
    span,
    wait,
    still,
    target,
    tween.setImmediate,
    tween.timingTo,
    tween.stop,
  ]);
  const slots = textAnimationVariants();
  return (
    <View
      aria-label={format(value)}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <View aria-hidden className="flex flex-col opacity-0">
        {Array.from({ length: rows }, (_, index) => (
          <Text
            key={index}
            size={size}
            weight={weight}
            className={cn("tabular-nums", textClassName)}
          >
            {placeholder}
          </Text>
        ))}
      </View>
      {highlight ? (
        <View
          className={cn(
            "pointer-events-none",
            slots.highlight({ className: highlightClassName })
          )}
          style={{
            height: `${(1 / rows) * 100}%`,
            left: 0,
            position: "absolute",
            right: 0,
            top: `${(around / rows) * 100}%`,
          }}
        />
      ) : null}
      <View
        aria-hidden
        className={cn("panel-text-scale flex flex-col", slots.column())}
        style={{
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
          transform: `translateY(${values.length ? (-offset / values.length) * 100 : 0}%)`,
        }}
      >
        {values.map((entry, index) => (
          <Text
            key={`${entry}-${index}`}
            size={size}
            weight={weight}
            className={cn("tabular-nums", textClassName)}
          >
            {format(entry)}
          </Text>
        ))}
      </View>
      {fade ? (
        <>
          <View
            className="pointer-events-none absolute top-0 right-0 left-0"
            style={{
              backgroundImage: `linear-gradient(to bottom, ${fade}, ${withAlpha(fade, 0)})`,
              height: `${(around / rows) * 100}%`,
            }}
          />
          <View
            className="pointer-events-none absolute right-0 bottom-0 left-0"
            style={{
              backgroundImage: `linear-gradient(to bottom, ${withAlpha(fade, 0)}, ${fade})`,
              height: `${(around / rows) * 100}%`,
            }}
          />
        </>
      ) : null}
    </View>
  );
};
TextAnimationScrolling.displayName = "TextAnimation.Scrolling";
