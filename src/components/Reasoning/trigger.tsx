import { View } from "@tarojs/components";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { ChevronDownIcon, SparklesIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useReasoning } from "./context";
import { ReasoningLabel } from "./label";
import type { ReasoningTriggerProps } from "./types";
import { reasoningVariants } from "./variants";

export const ReasoningTrigger = ({
  className,
  label,
  children,
  onPress,
  onClick,
  ...props
}: ReasoningTriggerProps) => {
  const { open, setOpen } = useReasoning("Reasoning.Trigger");
  const slots = reasoningVariants();
  const reduced = usePanelReducedMotion();
  return (
    <AnimatedPressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ ...props.accessibilityState, expanded: open }}
      pressScale={1}
      pressOpacity={1}
      onClick={(event) => {
        (onClick ?? onPress)?.(event);
        setOpen(!open);
      }}
      className={cn(slots.trigger(), className)}
    >
      {children ?? (
        <>
          <SparklesIcon size={16} />
          <View className="flex-1">
            <ReasoningLabel label={label} />
          </View>
          <View
            style={{
              transform: `rotate(${open ? 180 : 0}deg)`,
              transition: reduced ? "none" : "transform 180ms ease",
            }}
          >
            <ChevronDownIcon size={16} />
          </View>
        </>
      )}
    </AnimatedPressable>
  );
};
