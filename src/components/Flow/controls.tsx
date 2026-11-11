import { View } from "@tarojs/components";

import {
  IconColorProvider,
  LockIcon,
  MaximizeIcon,
  MinusIcon,
  PlusIcon,
  UnlockIcon,
} from "../../icons";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { useFlow } from "./context";
import type { FlowControlsProps } from "./types";
import { flowVariants } from "./variants";

export const FlowControls = ({
  className,
  zoom: showZoom = true,
  fit = true,
  lock = true,
  step = 1.3,
}: FlowControlsProps) => {
  const { zoomBy, fitView, locked, setLocked } = useFlow("Flow.Controls");
  const slots = flowVariants();
  const token = useThemeToken("muted-foreground");
  const tint = typeof token === "string" ? token : "#737373";
  return (
    <IconColorProvider color={tint}>
      <View className={slots.controls({ className })}>
        {showZoom ? (
          <>
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel="Zoom in"
              className={slots.control()}
              onPress={() => zoomBy(step)}
            >
              <PlusIcon size={16} />
            </AnimatedPressable>
            <View className="h-[2px] bg-[var(--panel-border)]" />
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel="Zoom out"
              className={slots.control()}
              onPress={() => zoomBy(1 / step)}
            >
              <MinusIcon size={16} strokeWidth={2} />
            </AnimatedPressable>
          </>
        ) : null}
        {fit ? (
          <>
            <View className="h-[2px] bg-[var(--panel-border)]" />
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel="Fit the whole graph on screen"
              className={slots.control()}
              onPress={fitView}
            >
              <MaximizeIcon size={16} />
            </AnimatedPressable>
          </>
        ) : null}
        {lock ? (
          <>
            <View className="h-[2px] bg-[var(--panel-border)]" />
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel={
                locked ? "Unlock the canvas" : "Lock the canvas"
              }
              accessibilityState={{ selected: locked }}
              className={slots.control()}
              onPress={() => setLocked(!locked)}
            >
              {locked ? <LockIcon size={16} /> : <UnlockIcon size={16} />}
            </AnimatedPressable>
          </>
        ) : null}
      </View>
    </IconColorProvider>
  );
};

FlowControls.slot = "overlay" as const;
