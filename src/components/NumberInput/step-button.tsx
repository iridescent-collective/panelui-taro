import { useRef } from "react";

import { MinusIcon, PlusIcon } from "../../icons";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";

export const StepButton = ({
  direction,
  label,
  disabled,
  bound,
  iconSize,
  className,
  start,
  stop,
}: {
  direction: 1 | -1;
  label?: string;
  disabled?: boolean;
  bound: boolean;
  iconSize: number;
  className: string;
  start: (direction: 1 | -1) => void;
  stop: () => void;
}) => {
  const touched = useRef(false);
  const color = useThemeToken("foreground");
  const Icon = direction === 1 ? PlusIcon : MinusIcon;
  return (
    <AnimatedPressable
      className={className}
      disabled={disabled || bound}
      pressOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={`${direction === 1 ? "Increase" : "Decrease"} ${label ?? "value"}`}
      accessibilityState={{ disabled: disabled || bound }}
      style={bound ? { opacity: 0.4 } : undefined}
      onPressIn={() => {
        touched.current = true;
        start(direction);
      }}
      onPressOut={stop}
      onTouchCancel={() => {
        touched.current = false;
        stop();
      }}
      onPress={() => {
        if (!touched.current) {
          start(direction);
          stop();
        }
        touched.current = false;
      }}
    >
      <Icon
        size={iconSize}
        color={color}
        strokeWidth={direction === -1 ? 2 : undefined}
      />
    </AnimatedPressable>
  );
};
