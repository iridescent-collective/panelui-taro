import { View } from "@tarojs/components";
import { isValidElement } from "react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { Shimmer } from "../Shimmer";
import { usePlan } from "./context";
import type {
  PlanHeaderProps,
  PlanIconProps,
  PlanTitleProps,
  PlanDescriptionProps,
  PlanActionProps,
} from "./types";
import { planVariants } from "./variants";

export const PlanIcon = ({ className, children, ...props }: PlanIconProps) => (
  <View {...props} className={cn(planVariants().icon(), "flex", className)}>
    {children}
  </View>
);
export const PlanAction = ({
  className,
  children,
  ...props
}: PlanActionProps) => (
  <View {...props} className={planVariants().action({ className })}>
    {children}
  </View>
);
export const PlanHeader = ({
  className,
  children,
  ...props
}: PlanHeaderProps) => {
  const slots = planVariants();
  const icons: ReactNode[] = [];
  const headings: ReactNode[] = [];
  const actions: ReactNode[] = [];
  for (const child of Array.isArray(children) ? children : [children]) {
    if (isValidElement(child) && child.type === PlanAction) {
      actions.push(child);
    } else if (isValidElement(child) && child.type === PlanIcon) {
      icons.push(child);
    } else {
      headings.push(child);
    }
  }
  return (
    <View {...props} className={slots.header({ className })}>
      {icons}
      <View className={cn(slots.heading(), "flex flex-col")}>{headings}</View>
      {actions}
    </View>
  );
};
export const PlanTitle = ({
  className,
  children,
  ...props
}: PlanTitleProps) => {
  const { isStreaming } = usePlan("Plan.Title");
  const title = planVariants().title({ className });
  if (isStreaming && typeof children === "string") {
    return (
      <Shimmer role="heading" aria-role="heading" textClassName={title}>
        {children}
      </Shimmer>
    );
  }
  return (
    <Text {...props} role="heading" aria-role="heading" className={title}>
      {children}
    </Text>
  );
};
export const PlanDescription = ({
  className,
  children,
  ...props
}: PlanDescriptionProps) => {
  const { isStreaming } = usePlan("Plan.Description");
  const description = planVariants().description({ className });
  if (isStreaming && typeof children === "string") {
    return <Shimmer textClassName={description}>{children}</Shimmer>;
  }
  return (
    <Text {...props} className={description}>
      {children}
    </Text>
  );
};
