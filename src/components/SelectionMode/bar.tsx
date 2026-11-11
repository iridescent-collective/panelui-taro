import { View } from "@tarojs/components";
import { useEffect, useRef, useState } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useTimingNumber } from "../../hooks/use-timing-number";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { textChildren } from "../primitives/Text";
import { DEFAULT_BAR_OFFSET } from "./constants";
import { useSelectionMode } from "./context";
import type { SelectionModeBarProps } from "./types";
import { selectionVariants } from "./variants";

const useBarPresence = (visible: boolean, duration: number) => {
  const [retained, setRetained] = useState(visible);
  useEffect(() => {
    if (visible) {
      setRetained(true);
      return;
    }
    if (!retained) {
      return;
    }
    const timer = setTimeout(() => setRetained(false), duration);
    return () => clearTimeout(timer);
  }, [visible, duration, retained]);
  return visible || retained;
};
const barDuration = (visible: boolean, reduced: boolean) => {
  if (reduced) {
    return 300;
  }
  return visible ? 220 : 180;
};
export const SelectionModeBar = ({
  className,
  placement,
  inset = 0,
  showWhenEmpty = false,
  children,
  style,
  ...props
}: SelectionModeBarProps) => {
  const { active, count, sheet } = useSelectionMode();
  const reduced = usePanelReducedMotion();
  const visible = active && (count > 0 || showWhenEmpty);
  const duration = barDuration(visible, reduced);
  const mounted = useBarPresence(
    visible && !sheet,
    barDuration(false, reduced)
  );
  const progress = useTimingNumber(
    Number(visible && !sheet),
    duration,
    false,
    0
  );
  const retained = useRef(children);
  if (visible) {
    retained.current = children;
  }
  const slots = selectionVariants({ placement });
  if (sheet) {
    return visible ? (
      <View {...props} className={cn(slots.bar(), "border-t-0", className)}>
        {textChildren(children)}
      </View>
    ) : null;
  }
  if (!mounted) {
    return null;
  }
  const floating = placement === "floating";
  const edge = floating ? inset || DEFAULT_BAR_OFFSET : 0;
  return (
    <View
      {...props}
      aria-hidden={!visible}
      style={mergeStyle(
        {
          bottom: `${edge * 2}rpx`,
          left: `${edge * 2}rpx`,
          opacity: reduced ? progress : 1,
          pointerEvents: visible ? "auto" : "none",
          position: "absolute",
          right: `${edge * 2}rpx`,
          transform: reduced
            ? "none"
            : `translateY(calc(${(1 - progress) * 100}% + ${(1 - progress) * edge * 2}rpx))`,
          zIndex: 1,
        },
        style
      )}
    >
      <View
        className={cn(slots.bar(), className)}
        style={floating ? undefined : { paddingBottom: `${inset * 2}rpx` }}
      >
        {textChildren(retained.current)}
      </View>
    </View>
  );
};
SelectionModeBar.displayName = "SelectionMode.Bar";
