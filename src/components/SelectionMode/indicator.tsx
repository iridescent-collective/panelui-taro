import { View } from "@tarojs/components";
import { useContext, useEffect, useSyncExternalStore } from "react";

import { useMotionNumber } from "../../hooks/use-motion-number";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { CheckIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { TICK_SPRING } from "./constants";
import { SelectionModeItemContext, useSelectionMode } from "./context";
import type { SelectionModeIndicatorProps } from "./types";
import { selectionVariants } from "./variants";

export const SelectionModeIndicator = ({
  className,
  value,
}: SelectionModeIndicatorProps) => {
  const { isSelected } = useSelectionMode();
  const row = useContext(SelectionModeItemContext);
  const target = value ?? row?.value;
  const selected = target !== undefined && isSelected(target);
  const reduced = usePanelReducedMotion();
  const motion = useMotionNumber(Number(selected), TICK_SPRING);
  const { setImmediate, springTo, timingTo, signal } = motion;
  useEffect(() => {
    if (reduced) {
      setImmediate(Number(selected));
    } else if (selected) {
      springTo(1);
    } else {
      timingTo(0, 120);
    }
  }, [selected, reduced, setImmediate, springTo, timingTo]);
  const progress = useSyncExternalStore(
    signal.subscribe,
    signal.getSnapshot,
    signal.getSnapshot
  );
  const color = useThemeToken("primary-foreground");
  const slots = selectionVariants({ selected });
  return (
    <View
      aria-hidden
      className={cn(slots.circle(), "relative flex shrink-0", className)}
    >
      <View
        className={cn(slots.fill(), "flex")}
        style={{
          opacity: progress,
          transform: `scale(${0.6 + progress * 0.4})`,
        }}
      >
        <CheckIcon size={14} color={color} />
      </View>
    </View>
  );
};
SelectionModeIndicator.displayName = "SelectionMode.Indicator";
