import { View } from "@tarojs/components";
import { useMemo } from "react";

import { cn } from "../../lib/utils";
import { useControllableState } from "../../primitives/controllable-state";
import { ReasoningContent } from "./content";
import { ReasoningContext } from "./context";
import { ReasoningTrigger } from "./trigger";
import type { ReasoningProps } from "./types";
import { useReasoningTiming } from "./use-timing";
import { reasoningVariants } from "./variants";

export type {
  ReasoningProps,
  ReasoningTriggerProps,
  ReasoningContentProps,
} from "./types";
const ReasoningRoot = ({
  className,
  isStreaming = false,
  duration,
  open,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: ReasoningProps) => {
  const state = useControllableState({
    defaultValue: defaultOpen ?? isStreaming,
    onChange: onOpenChange,
    value: open,
  });
  const measured = useReasoningTiming(
    isStreaming,
    state.value,
    defaultOpen === false,
    state.setValue
  );
  const context = useMemo(
    () => ({
      duration: duration ?? measured,
      isStreaming,
      open: state.value,
      setOpen: state.setValue,
    }),
    [isStreaming, state.value, state.setValue, duration, measured]
  );
  return (
    <ReasoningContext.Provider value={context}>
      <View
        {...props}
        className={cn(reasoningVariants().root(), "flex flex-col", className)}
      >
        {children}
      </View>
    </ReasoningContext.Provider>
  );
};
export const Reasoning = Object.assign(ReasoningRoot, {
  Content: ReasoningContent,
  Trigger: ReasoningTrigger,
});
