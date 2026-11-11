import { View } from "@tarojs/components";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { useMotionNumber } from "../../hooks/use-motion-number";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { ArrowUpIcon, ArrowDownIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { usePostPop } from "./motion";
import { COUNT_DURATION, POP, numeric } from "./utils";

export const PostCount = ({
  value,
  className,
  color,
}: {
  value: ReactNode;
  className?: string;
  color?: string;
}) => {
  const reduced = usePanelReducedMotion();
  const previous = useRef(value);
  const [exit, setExit] = useState<ReactNode>(null);
  const [travel, setTravel] = useState(0);
  const motion = useMotionNumber(1, POP);
  const progress = useSyncExternalStore(
    motion.signal.subscribe,
    motion.signal.getSnapshot,
    motion.signal.getSnapshot
  );
  useEffect(() => {
    const old = previous.current;
    const changed = old !== value;
    const before = numeric(old);
    const after = numeric(value);
    let direction = 0;
    if (before !== null && after !== null && before !== after) {
      direction = after > before ? 1 : -1;
    }
    previous.current = value;
    if (!changed || reduced) {
      setExit(null);
      motion.setImmediate(1);
      return;
    }
    setExit(old);
    setTravel(direction);
    motion.setImmediate(0);
    motion.timingTo(1, COUNT_DURATION);
    const timer = setTimeout(() => setExit(null), COUNT_DURATION);
    return () => clearTimeout(timer);
  }, [value, reduced, motion.setImmediate, motion.timingTo]);
  const style = color ? { color } : undefined;
  if (reduced) {
    return (
      <Text className={className} style={style}>
        {value}
      </Text>
    );
  }
  return (
    <View
      className="relative"
      aria-label={
        typeof value === "string" || typeof value === "number"
          ? String(value)
          : undefined
      }
    >
      {exit === null ? null : (
        <View
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ opacity: 1 - progress }}
        >
          <Text className={className} style={style}>
            {exit}
          </Text>
        </View>
      )}
      <View
        style={{
          opacity: progress,
          transform: `translateY(${-travel * 25 * (1 - progress) * 2}rpx)`,
        }}
      >
        <Text className={className} style={style}>
          {value}
        </Text>
      </View>
    </View>
  );
};
export const VoteArrow = ({
  direction,
  active,
  color,
  disabled,
  className,
  onPress,
}: {
  direction: "up" | "down";
  active: boolean;
  color: string;
  disabled: boolean;
  className: string;
  onPress: () => void;
}) => {
  const travel = direction === "up" ? -5 : 5;
  const shift = usePostPop(active, 100, 0, active ? travel : -travel * 0.4, 0);
  const scale = usePostPop(active, 100, 1, active ? 1.2 : 0.9, 1);
  const Arrow = direction === "up" ? ArrowUpIcon : ArrowDownIcon;
  return (
    <AnimatedPressable
      pressScale={1}
      pressOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={direction === "up" ? "Upvote" : "Downvote"}
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
      hitSlop={6}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      className={cn(className, disabled && "opacity-[0.64]")}
    >
      <View
        style={{ transform: `translateY(${shift * 2}rpx) scale(${scale})` }}
      >
        <Arrow size={17} color={color} filled={active} />
      </View>
    </AnimatedPressable>
  );
};
