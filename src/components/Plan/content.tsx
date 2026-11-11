import { View } from "@tarojs/components";
import { Children, isValidElement } from "react";

import { cn } from "../../lib/utils";
import { Collapse } from "../../primitives/collapse";
import { Text, textChildren } from "../primitives/Text";
import { usePlan } from "./context";
import type {
  PlanContentProps,
  PlanProgressProps,
  PlanFooterProps,
} from "./types";
import { planVariants } from "./variants";

export const PlanContent = ({
  className,
  children,
  ...props
}: PlanContentProps) => {
  const { open } = usePlan("Plan.Content");
  const slots = planVariants();
  return (
    <Collapse
      {...props}
      open={open}
      aria-hidden={!open}
      className={cn(slots.content(), "flex flex-col", className)}
    >
      {textChildren(children, (text) => (
        <Text className={slots.description()}>{text}</Text>
      ))}
    </Collapse>
  );
};
export const PlanProgress = ({
  className,
  value,
  total,
  ...props
}: PlanProgressProps) => {
  const { counts } = usePlan("Plan.Progress");
  const done = value ?? counts?.done;
  const all = total ?? counts?.total;
  if (done === undefined || !all) {
    return null;
  }
  return (
    <Text {...props} className={planVariants().progress({ className })}>
      {done} of {all}
    </Text>
  );
};
export const PlanFooter = ({
  className,
  layout = "stretch",
  children,
  ...props
}: PlanFooterProps) => (
  <View
    {...props}
    className={cn(
      planVariants().footer(),
      layout === "end" && "justify-end",
      className
    )}
  >
    {layout === "stretch"
      ? Children.map(children, (child) =>
          isValidElement(child) ? (
            <View className="flex flex-1 flex-col items-stretch">{child}</View>
          ) : (
            child
          )
        )
      : children}
  </View>
);
