import { View } from "@tarojs/components";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { useSourceSpringController } from "../../hooks/use-source-spring";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { DIGITS, NUMBER_SPRING } from "./constants";
import { useShared, useStill } from "./context";
import type { TextAnimationSlidingProps } from "./types";
import { textAnimationVariants } from "./variants";

const SlidingColumn = ({
  digit,
  delay,
  still,
  className,
  size,
  weight,
}: {
  digit: number;
  delay: number;
  still: boolean;
  className?: string;
  size?: TextProps["size"];
  weight?: TextProps["weight"];
}) => {
  const spring = useSourceSpringController(
    still ? digit : 0,
    NUMBER_SPRING,
    still
  );
  const offset = useSyncExternalStore(
    spring.signal.subscribe,
    spring.signal.getSnapshot,
    spring.signal.getSnapshot
  );
  useEffect(() => {
    if (still) {
      spring.setImmediate(digit);
      return;
    }
    const timer = setTimeout(() => spring.springTo(digit), delay);
    return () => {
      clearTimeout(timer);
      spring.setImmediate(spring.read());
    };
  }, [delay, digit, still, spring.setImmediate, spring.springTo, spring.read]);
  return (
    <View className="relative overflow-hidden">
      <Text
        aria-hidden
        size={size}
        weight={weight}
        className={cn("opacity-0", className)}
      >
        0
      </Text>
      <View
        aria-hidden
        className={cn(
          "panel-text-digit flex flex-col",
          textAnimationVariants().column()
        )}
        style={{
          position: "absolute",
          top: 0,
          transform: `translateY(${(-offset / DIGITS.length) * 100}%)`,
        }}
      >
        {DIGITS.map((n) => (
          <Text
            key={n}
            size={size}
            weight={weight}
            className={cn("tabular-nums", className)}
          >
            {n}
          </Text>
        ))}
      </View>
    </View>
  );
};
export const TextAnimationSliding = ({
  className,
  value,
  decimals = 0,
  padStart = 1,
  thousandSeparator,
  decimalSeparator = ".",
  textClassName,
  size,
  weight,
  delay,
  enabled,
  ...props
}: TextAnimationSlidingProps) => {
  const wait = useShared("delay", delay, 0);
  const still = useStill(useShared("enabled", enabled, true));
  const { whole, fraction, negative } = useMemo(() => {
    const fixed = Math.abs(value).toFixed(decimals);
    const [left = "0", right = ""] = fixed.split(".");
    return {
      fraction: right,
      negative: value < 0,
      whole: left.padStart(padStart, "0"),
    };
  }, [decimals, padStart, value]);
  const columns: ReactNode[] = [];
  for (const [index, digit] of [...whole].entries()) {
    const fromEnd = whole.length - index - 1;
    columns.push(
      <SlidingColumn
        key={`w${index}`}
        digit={Number(digit)}
        delay={wait}
        still={still}
        className={textClassName}
        size={size}
        weight={weight}
      />
    );
    if (thousandSeparator && fromEnd > 0 && fromEnd % 3 === 0) {
      columns.push(
        <Text
          key={`s${index}`}
          size={size}
          weight={weight}
          className={textClassName}
        >
          {thousandSeparator}
        </Text>
      );
    }
  }
  if (fraction) {
    columns.push(
      <Text key="point" size={size} weight={weight} className={textClassName}>
        {decimalSeparator}
      </Text>
    );
    for (const [index, digit] of [...fraction].entries()) {
      columns.push(
        <SlidingColumn
          key={`f${index}`}
          digit={Number(digit)}
          delay={wait}
          still={still}
          className={textClassName}
          size={size}
          weight={weight}
        />
      );
    }
  }
  return (
    <View
      aria-label={`${negative ? "-" : ""}${whole}${fraction ? decimalSeparator + fraction : ""}`}
      className={textAnimationVariants().digits({ className })}
      {...props}
    >
      {negative ? (
        <Text size={size} weight={weight} className={textClassName}>
          −
        </Text>
      ) : null}
      {columns}
    </View>
  );
};
TextAnimationSliding.displayName = "TextAnimation.Sliding";
