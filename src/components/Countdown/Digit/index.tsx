import { View } from "@tarojs/components";
import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "../../../lib/utils";
import { Text } from "../../primitives/Text";

const DIGIT_DURATION = 260;
export interface DigitProps {
  value: string;
  animate: boolean;
  className: string;
}
export const Digit = ({ value, animate, className }: DigitProps) => {
  const prior = useRef(value);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  useLayoutEffect(() => {
    const old = prior.current;
    prior.current = value;
    if (!animate || old === value) {
      setOutgoing(null);
      return;
    }
    setOutgoing(old);
    const timer = setTimeout(() => setOutgoing(null), DIGIT_DURATION);
    return () => clearTimeout(timer);
  }, [animate, value]);
  const active = animate && outgoing !== null;
  return (
    <View className="relative overflow-hidden">
      <Text aria-hidden className={cn(className, "opacity-0")}>
        0
      </Text>
      {active ? (
        <View
          key={`old-${outgoing}`}
          aria-hidden
          className="panelui-countdown-digit panelui-countdown-digit--out"
        >
          <Text className={cn(className, "text-center")}>{outgoing}</Text>
        </View>
      ) : null}
      <View
        key={`new-${value}`}
        className={cn(
          "panelui-countdown-digit",
          active && "panelui-countdown-digit--in"
        )}
      >
        <Text className={cn(className, "text-center")}>{value}</Text>
      </View>
    </View>
  );
};
