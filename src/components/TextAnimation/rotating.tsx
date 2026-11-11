import { View } from "@tarojs/components";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { cn } from "../../lib/utils";
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import { Text } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import {
  ROTATE_DISTANCE,
  ROTATE_DURATION,
  ROTATE_IN_OPACITY_DURATION,
  ROTATE_OUT_OPACITY_DURATION,
} from "./constants";
import { useShared, useStill } from "./context";
import type { TextAnimationRotatingProps } from "./types";

const cubicIn = (value: number) => value ** 3;
const RotatingPhrase = ({
  phrase,
  measured,
  active,
  still,
  textProps,
}: {
  phrase: string;
  measured: boolean;
  active: boolean;
  still: boolean;
  textProps: Omit<TextProps, "children">;
}) => {
  const travel = useChartTween(
    active ? 0 : ROTATE_DISTANCE,
    active ? chartCubicOut : cubicIn
  );
  const opacity = useChartTween(active ? 1 : 0);
  useEffect(() => {
    if (still) {
      travel.setImmediate(active ? 0 : ROTATE_DISTANCE);
      opacity.setImmediate(active ? 1 : 0);
      return;
    }
    if (active) {
      travel.setImmediate(ROTATE_DISTANCE);
      travel.timingTo(0, ROTATE_DURATION);
      opacity.timingTo(1, ROTATE_IN_OPACITY_DURATION);
    } else {
      travel.timingTo(-ROTATE_DISTANCE, ROTATE_DURATION);
      opacity.timingTo(0, ROTATE_OUT_OPACITY_DURATION);
    }
  }, [
    active,
    still,
    travel.setImmediate,
    travel.timingTo,
    opacity.setImmediate,
    opacity.timingTo,
  ]);
  const y = useSyncExternalStore(
    travel.signal.subscribe,
    travel.signal.getSnapshot,
    travel.signal.getSnapshot
  );
  const alpha = useSyncExternalStore(
    opacity.signal.subscribe,
    opacity.signal.getSnapshot,
    opacity.signal.getSnapshot
  );
  return (
    <View
      aria-hidden={!active}
      className="panel-text-phrase"
      style={{
        opacity: alpha,
        transform: `translateY(${y * 2}rpx)`,
        ...(measured ? {} : { left: 0, position: "absolute", right: 0 }),
      }}
    >
      <Text {...textProps}>{phrase}</Text>
    </View>
  );
};
export const TextAnimationRotating = ({
  className,
  text,
  duration,
  delay,
  enabled,
  ...props
}: TextAnimationRotatingProps) => {
  const period = useShared("duration", duration, 2200);
  const wait = useShared("delay", delay, 0);
  const still = useStill(useShared("enabled", enabled, true));
  const phrases = useMemo(
    () => (typeof text === "string" ? [text] : text),
    [text]
  );
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (still || phrases.length < 2) {
      return;
    }
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      setIndex((current) => (current + 1) % phrases.length);
      interval = setInterval(
        () => setIndex((current) => (current + 1) % phrases.length),
        period
      );
    }, wait + period);
    return () => {
      clearTimeout(start);
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [period, phrases.length, still, wait]);
  return (
    <View
      className={cn("relative inline-flex flex-col overflow-hidden", className)}
    >
      <View aria-hidden className="pointer-events-none flex h-0 flex-col">
        {phrases.map((phrase, at) => (
          <Text key={`${phrase}-${at}`} {...props} className="opacity-0">
            {phrase}
          </Text>
        ))}
      </View>
      {phrases.map((phrase, at) => (
        <RotatingPhrase
          key={`${phrase}-${at}`}
          phrase={phrase}
          measured={at === 0}
          active={at === (phrases.length ? index % phrases.length : 0)}
          still={still}
          textProps={props}
        />
      ))}
    </View>
  );
};
TextAnimationRotating.displayName = "TextAnimation.Rotating";
