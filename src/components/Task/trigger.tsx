import { View } from "@tarojs/components";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { ChevronDownIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { Shimmer } from "../Shimmer";
import { useTask } from "./context";
import { TaskStatusIcon } from "./status-icon";
import type { TaskTriggerProps } from "./types";
import { taskVariants } from "./variants";

export const TaskTrigger = ({
  className,
  title,
  icon,
  children,
  onPress,
  onClick,
  ...props
}: TaskTriggerProps) => {
  const { status, open, setOpen } = useTask("Task.Trigger");
  const slots = taskVariants({ status });
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
          {icon ?? <TaskStatusIcon status={status} />}
          {status === "running" && title ? (
            <View className="flex-1">
              <Shimmer textClassName={slots.title()}>{title}</Shimmer>
            </View>
          ) : (
            <Text numberOfLines={1} className={slots.title()}>
              {title}
            </Text>
          )}
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
