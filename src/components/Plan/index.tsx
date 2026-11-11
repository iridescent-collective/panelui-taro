import { View } from "@tarojs/components";
import { useCallback, useMemo, useState } from "react";

import { cn } from "../../lib/utils";
import { useControllableState } from "../../primitives/controllable-state";
import { PlanContent, PlanProgress, PlanFooter } from "./content";
import { PlanContext } from "./context";
import {
  PlanHeader,
  PlanIcon,
  PlanTitle,
  PlanDescription,
  PlanAction,
} from "./header";
import { PlanSteps, PlanStep } from "./steps";
import { PlanTrigger } from "./trigger";
import type { PlanProps, PlanStepCounts } from "./types";
import { planVariants } from "./variants";

export type {
  PlanProps,
  PlanStepCounts,
  PlanStepStatus,
  PlanHeaderProps,
  PlanIconProps,
  PlanTitleProps,
  PlanDescriptionProps,
  PlanActionProps,
  PlanTriggerProps,
  PlanContentProps,
  PlanStepsProps,
  PlanStepProps,
  PlanProgressProps,
  PlanFooterProps,
} from "./types";

const PlanRoot = ({
  className,
  isStreaming = false,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  children,
  ...props
}: PlanProps) => {
  const { value: open, setValue: setOpen } = useControllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: openProp,
  });
  const [counts, setCounts] = useState<PlanStepCounts | null>(null);
  const reportCounts = useCallback((next: PlanStepCounts) => {
    setCounts((current) =>
      current && current.done === next.done && current.total === next.total
        ? current
        : next
    );
  }, []);
  const context = useMemo(
    () => ({ counts, isStreaming, open, reportCounts, setOpen }),
    [isStreaming, open, setOpen, counts, reportCounts]
  );
  return (
    <PlanContext.Provider value={context}>
      <View
        {...props}
        className={cn(planVariants().root(), "flex flex-col", className)}
      >
        {children}
      </View>
    </PlanContext.Provider>
  );
};
export const Plan = Object.assign(PlanRoot, {
  Action: PlanAction,
  Content: PlanContent,
  Description: PlanDescription,
  Footer: PlanFooter,
  Header: PlanHeader,
  Icon: PlanIcon,
  Progress: PlanProgress,
  Step: PlanStep,
  Steps: PlanSteps,
  Title: PlanTitle,
  Trigger: PlanTrigger,
});
