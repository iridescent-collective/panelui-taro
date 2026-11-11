import { View } from "@tarojs/components";
import { useMemo } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useTimingNumber } from "../../hooks/use-timing-number";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { CANCEL_DURATION, CANCEL_GAP } from "./constants";
import type { SearchBarSize } from "./types";
import { searchBarVariants } from "./variants";

export const SearchCancel = ({
  id,
  size,
  label,
  visible,
  always,
  disabled,
  onPress,
}: {
  id: string;
  size: SearchBarSize;
  label: string;
  visible: boolean;
  always: boolean;
  disabled?: boolean;
  onPress: () => void;
}) => {
  const reduced = usePanelReducedMotion();
  const dependencies = useMemo(() => ({ label, size }), [label, size]);
  const measured = useElementLayout(true, dependencies, id, false);
  const progress = useTimingNumber(
    Number(visible),
    CANCEL_DURATION,
    reduced,
    Number(always)
  );
  const slots = searchBarVariants({ size });
  return (
    <View
      aria-hidden={!visible}
      className={slots.cancelClip()}
      style={{
        opacity: progress,
        pointerEvents: visible ? "auto" : "none",
        position: "relative",
        width: `${((measured.layout?.width ?? 0) + CANCEL_GAP) * progress * 2}rpx`,
      }}
    >
      <AnimatedPressable
        id={measured.id}
        onPress={onPress}
        disabled={disabled}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        className={slots.cancelButton({ className: "flex" })}
      >
        <Text className={slots.cancelLabel()}>{label}</Text>
      </AnimatedPressable>
    </View>
  );
};
