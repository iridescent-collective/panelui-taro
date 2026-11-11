import { useEffect, useState } from "react";

import { cn } from "../../lib/utils";
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import { Text } from "../primitives/Text";
import { useShared, useStill } from "./context";
import type { TextAnimationCountingProps } from "./types";
import { useFormatter } from "./use-formatter";

export const TextAnimationCounting = ({
  className,
  value,
  from = 0,
  duration,
  delay,
  decimals = 0,
  formatOptions,
  enabled,
  ...props
}: TextAnimationCountingProps) => {
  const span = useShared("duration", duration, 1200);
  const wait = useShared("delay", delay, 0);
  const still = useStill(useShared("enabled", enabled, true));
  const format = useFormatter(decimals, formatOptions);
  const [shown, setShown] = useState(still ? value : from);
  const factor = 10 ** decimals;
  const tween = useChartTween(still ? value : from, chartCubicOut, (next) =>
    setShown(Math.round(next * factor) / factor)
  );
  useEffect(() => {
    tween.setImmediate(still ? value : from);
    setShown(still ? value : from);
    if (still) {
      return;
    }
    const timer = setTimeout(() => tween.timingTo(value, span), wait);
    return () => {
      clearTimeout(timer);
      tween.stop();
    };
  }, [
    from,
    value,
    span,
    wait,
    still,
    tween.setImmediate,
    tween.timingTo,
    tween.stop,
  ]);
  return (
    <Text
      aria-label={format(value)}
      className={cn("tabular-nums", className)}
      {...props}
    >
      {format(shown)}
    </Text>
  );
};
TextAnimationCounting.displayName = "TextAnimation.Counting";
