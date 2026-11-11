import { View } from "@tarojs/components";
import { forwardRef, useEffect, useRef, useState } from "react";
import type { ComponentProps, ComponentRef } from "react";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";

import { usePanelReducedMotion as useReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import {
  describeSeconds,
  msUntilNextTick,
  secondsLeft,
  splitSeconds,
  trimLeading,
} from "./countdown-time";
import type { CountdownPart, CountdownUnit } from "./countdown-time";
import { Digit } from "./Digit";
import { countdownVariants } from "./variants";

export type { CountdownUnit } from "./countdown-time";

type ViewProps = ComponentProps<typeof View>;
type CountdownVariantProps = VariantProps<typeof countdownVariants>;

const URGENT = {
  digit: "text-[color:var(--panel-destructive)]",
  separator: "text-[color:var(--panel-destructive-opacity-60)]",
};

const DEFAULT_LABELS: Record<CountdownUnit, string> = {
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
};

const SUFFIX: Record<CountdownUnit, string> = {
  days: "d",
  hours: "h",
  minutes: "m",
  seconds: "s",
};

export interface CountdownProps
  extends Omit<ViewProps, "children">, CountdownVariantProps {
  className?: string;

  to: Date | number;

  units?: CountdownUnit[];

  trim?: boolean;

  labels?: Partial<Record<CountdownUnit, string>>;

  urgentBelow?: number;

  onComplete?: () => void;

  onTick?: (secondsLeft: number) => void;
}

const Digits = ({
  part,
  animate,
  className,
}: {
  part: CountdownPart;
  animate: boolean;
  className: string;
}) => {
  const slots = countdownVariants();
  const text = String(part.value).padStart(2, "0");
  return (
    <View className={slots.digits()}>
      {[...text].map((char, index) => (
        <Digit
          key={text.length - index}
          value={char}
          animate={animate}
          className={className}
        />
      ))}
    </View>
  );
};

const CountdownRoot = forwardRef<ComponentRef<typeof View>, CountdownProps>(
  (
    {
      className,
      to,
      variant = "segmented",
      size = "md",
      units,
      trim = true,
      labels,
      urgentBelow,
      onComplete,
      onTick,
      ...props
    },
    ref
  ) => {
    const target = typeof to === "number" ? to : to.getTime();
    const [left, setLeft] = useState(() => secondsLeft(target, Date.now()));

    const completeRef = useRef(onComplete);
    const tickRef = useRef(onTick);
    completeRef.current = onComplete;
    tickRef.current = onTick;

    const mounted = useRef(false);
    useEffect(() => {
      mounted.current = true;
    }, []);

    useEffect(() => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      let done = false;
      const tick = () => {
        const now = Date.now();
        const next = secondsLeft(target, now);
        setLeft(next);
        tickRef.current?.(next);
        if (next === 0) {
          if (!done) {
            done = true;
            completeRef.current?.();
          }
          return;
        }

        timer = setTimeout(tick, msUntilNextTick(target, now) + 8);
      };
      tick();
      return () => clearTimeout(timer);
    }, [target]);

    const urgent =
      urgentBelow !== undefined &&
      urgentBelow !== null &&
      left > 0 &&
      left <= urgentBelow;
    const variants = countdownVariants({ size, variant });
    const slots = {
      ...variants,
      digit: () => cn(variants.digit(), urgent && URGENT.digit),
      separator: () => cn(variants.separator(), urgent && URGENT.separator),
    };
    const split = splitSeconds(left, units);
    const parts = trim ? trimLeading(split) : split;

    const reduced = useReducedMotion();
    const animate = mounted.current && !reduced;
    const names = { ...DEFAULT_LABELS, ...labels };

    return (
      <View
        ref={ref}
        role="timer"
        aria-role="timer"
        aria-label={describeSeconds(left)}
        className={slots.root({ className })}
        {...props}
      >
        {parts.map((part, index) => {
          if (variant === "inline") {
            const isDays = part.unit === "days";
            const nextIsClock =
              parts[index + 1] && parts[index + 1]?.unit !== "days";
            return (
              <View
                key={part.unit}
                className={slots.segment({
                  className:
                    variant === "inline" ? "flex flex-row" : "flex flex-col",
                })}
              >
                {isDays ? (
                  <>
                    <Text className={slots.digit()}>{part.value}</Text>
                    <Text className={slots.suffix()}>{SUFFIX.days} </Text>
                  </>
                ) : (
                  <>
                    <Digits
                      part={part}
                      animate={animate}
                      className={slots.digit()}
                    />
                    {nextIsClock ? (
                      <Text className={slots.separator()}>:</Text>
                    ) : null}
                  </>
                )}
              </View>
            );
          }

          return (
            <View
              key={part.unit}
              className={slots.segment({ className: "flex flex-col" })}
            >
              <Digits part={part} animate={animate} className={slots.digit()} />
              <Text className={slots.label()}>{names[part.unit]}</Text>
            </View>
          );
        })}
      </View>
    );
  }
);

export const Countdown = CountdownRoot;
