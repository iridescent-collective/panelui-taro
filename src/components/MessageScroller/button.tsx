import { View } from "@tarojs/components";
import { useEffect, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { ChevronDownIcon } from "../../icons";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useChartTween } from "../../primitives/chart-tween";
import { useThemeToken } from "../../theme/use-theme";
import { useScroller } from "./context";
import { isMessageScrollerTargetVisible } from "./math";
import type { MessageScrollerButtonProps } from "./types";

export const MessageScrollerButton = ({
  className,
  target = "end",
  accessibilityLabel,
  children,
  style,
  ...props
}: MessageScrollerButtonProps) => {
  const { distanceFromStart, distanceFromEnd, scrollToStart, scrollToEnd } =
    useScroller("MessageScroller.Button");
  const tint = useThemeToken("foreground");
  const distance = target === "end" ? distanceFromEnd : distanceFromStart;
  const value = useSyncExternalStore(
    distance.subscribe,
    distance.getSnapshot,
    distance.getSnapshot
  );
  const reduced = usePanelReducedMotion();
  const tween = useChartTween(0);
  const shown = useSyncExternalStore(
    tween.signal.subscribe,
    tween.signal.getSnapshot,
    tween.signal.getSnapshot
  );
  const interactive = shown > 0.5;
  const visible = isMessageScrollerTargetVisible(value) ? 1 : 0;
  useEffect(() => {
    if (reduced) {
      tween.setImmediate(visible);
    } else {
      tween.timingTo(visible, 160);
    }
  }, [visible, reduced, tween.setImmediate, tween.timingTo]);
  return (
    <View
      {...props}
      aria-hidden={!interactive}
      style={mergeStyle(
        {
          opacity: shown,
          pointerEvents: interactive ? "auto" : "none",
          transform: `translateY(${(1 - shown) * 16}rpx) scale(${0.92 + 0.08 * shown})`,
        },
        style
      )}
      className={cn("absolute bottom-[48px] self-center", className)}
    >
      <AnimatedPressable
        accessibilityLabel={
          accessibilityLabel ??
          (target === "end"
            ? "Jump to the latest message"
            : "Jump to the start")
        }
        accessibilityRole="button"
        disabled={!interactive}
        onPress={() =>
          target === "end" ? scrollToEnd(true) : scrollToStart(true)
        }
        className="flex h-[80px] w-[80px] items-center justify-center rounded-full border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-surface)] shadow-lg"
      >
        {children ?? (
          <ChevronDownIcon
            size={18}
            color={tint}
            style={
              target === "start" ? { transform: "rotate(180deg)" } : undefined
            }
          />
        )}
      </AnimatedPressable>
    </View>
  );
};
MessageScrollerButton.displayName = "MessageScroller.Button";
