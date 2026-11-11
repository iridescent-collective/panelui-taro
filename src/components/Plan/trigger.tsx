import { View } from "@tarojs/components";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { ChevronDownIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { usePlan } from "./context";
import type { PlanTriggerProps } from "./types";
import { planVariants } from "./variants";

export const PlanTrigger = ({
  className,
  children,
  onPress,
  onClick,
  ...props
}: PlanTriggerProps) => {
  const { open, setOpen } = usePlan("Plan.Trigger");
  const reduced = usePanelReducedMotion();
  return (
    <AnimatedPressable
      {...props}
      accessibilityRole={props.accessibilityRole ?? "button"}
      accessibilityLabel={
        props.accessibilityLabel ?? (open ? "Collapse plan" : "Expand plan")
      }
      accessibilityState={{ expanded: open, ...props.accessibilityState }}
      hitSlop={props.hitSlop ?? 6}
      pressScale={1}
      pressOpacity={1}
      onClick={(event) => {
        (onClick ?? onPress)?.(event);
        setOpen(!open);
      }}
      className={cn(planVariants().trigger(), "flex", className)}
    >
      {children ?? (
        <View
          style={{
            transform: `rotate(${open ? 180 : 0}deg)`,
            transition: reduced ? "none" : "transform 180ms ease",
          }}
        >
          <ChevronDownIcon size={16} />
        </View>
      )}
    </AnimatedPressable>
  );
};
