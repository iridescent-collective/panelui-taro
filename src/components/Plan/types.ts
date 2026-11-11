import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import type { TextProps } from "../primitives/Text";

export type PlanStepStatus = "pending" | "active" | "done" | "skipped";
export interface PlanStepCounts {
  done: number;
  total: number;
}
export interface PlanProps extends ComponentProps<typeof View> {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export type PlanHeaderProps = ComponentProps<typeof View>;
export type PlanIconProps = PlanHeaderProps;
export type PlanTitleProps = TextProps;
export type PlanDescriptionProps = TextProps;
export type PlanActionProps = PlanHeaderProps;
export type PlanTriggerProps = Omit<AnimatedPressableProps, "style">;
export type PlanContentProps = PlanHeaderProps;
export type PlanStepsProps = PlanHeaderProps;
export interface PlanStepProps extends PlanHeaderProps {
  status?: PlanStepStatus;
  description?: ReactNode;
  meta?: ReactNode;
  last?: boolean;
}
export interface PlanProgressProps extends TextProps {
  value?: number;
  total?: number;
}
export interface PlanFooterProps extends PlanHeaderProps {
  layout?: "stretch" | "end";
}
export interface PlanContextValue {
  isStreaming: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  counts: PlanStepCounts | null;
  reportCounts: (counts: PlanStepCounts) => void;
}
