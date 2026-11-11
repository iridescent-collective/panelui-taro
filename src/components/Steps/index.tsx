import { View } from "@tarojs/components";
import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ComponentRef } from "react";

import { textChildren } from "../primitives/Text";
import {
  StepsContext,
  StepItemContext,
  StepPositionContext,
  useSteps,
} from "./context";
import {
  StepsTrigger,
  StepsIndicator,
  StepsTitle,
  StepsDescription,
  StepsSeparator,
} from "./parts";
import type { StepsProps, StepsItemProps, StepState } from "./types";
import { stepsVariants } from "./variants";

export type {
  StepState,
  StepsOrientation,
  StepsProps,
  StepsItemProps,
  StepsTriggerProps,
  StepsIndicatorProps,
  StepsSeparatorProps,
} from "./types";
const StepsItem = forwardRef<ComponentRef<typeof View>, StepsItemProps>(
  (
    {
      className,
      step,
      completed = false,
      disabled = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    const { activeStep, orientation, separators } = useSteps("Steps.Item");
    const placement = useContext(StepPositionContext);
    const isLoading = loading && step === activeStep;
    let state: StepState = "inactive";
    if (completed || step < activeStep) {
      state = "completed";
    } else if (step === activeStep) {
      state = isLoading ? "loading" : "active";
    }
    const context = useMemo(
      () => ({ isDisabled: disabled, isLoading, state, step }),
      [step, state, disabled, isLoading]
    );
    const { item } = stepsVariants({ orientation, state });
    const isLast = placement
      ? placement.position === placement.total - 1
      : true;
    const hasOwnSeparator = Children.toArray(children).some(
      (child) => isValidElement(child) && child.type === StepsSeparator
    );
    return (
      <StepItemContext.Provider value={context}>
        <View ref={ref} className={item({ className })} {...props}>
          {textChildren(children)}
          {separators && !isLast && !hasOwnSeparator ? (
            <StepsSeparator />
          ) : null}
        </View>
      </StepItemContext.Provider>
    );
  }
);
const StepsRoot = forwardRef<ComponentRef<typeof View>, StepsProps>(
  (
    {
      className,
      defaultValue = 0,
      value,
      onValueChange,
      orientation = "horizontal",
      separators = true,
      children,
      ...props
    },
    ref
  ) => {
    const [internalStep, setInternalStep] = useState(defaultValue);
    const isControlled = value !== undefined;
    const activeStep = isControlled ? value : internalStep;
    const setActiveStep = useCallback(
      (step: number) => {
        if (!isControlled) {
          setInternalStep(step);
        }
        onValueChange?.(step);
      },
      [isControlled, onValueChange]
    );
    const context = useMemo(
      () => ({ activeStep, orientation, separators, setActiveStep }),
      [activeStep, setActiveStep, orientation, separators]
    );
    const { root } = stepsVariants({ orientation });
    const nodes = Children.toArray(textChildren(children));
    const total = nodes.filter(
      (node) => isValidElement(node) && node.type === StepsItem
    ).length;
    let position = -1;
    return (
      <StepsContext.Provider value={context}>
        <View ref={ref} className={root({ className })} {...props}>
          {nodes.map((node) => {
            if (!isValidElement(node) || node.type !== StepsItem) {
              return node;
            }
            position += 1;
            const placement = { position, total };
            return (
              <StepPositionContext.Provider
                key={node.key ?? position}
                value={placement}
              >
                {node}
              </StepPositionContext.Provider>
            );
          })}
        </View>
      </StepsContext.Provider>
    );
  }
);
export const Steps = Object.assign(StepsRoot, {
  Description: StepsDescription,
  Indicator: StepsIndicator,
  Item: StepsItem,
  Separator: StepsSeparator,
  Title: StepsTitle,
  Trigger: StepsTrigger,
});
StepsRoot.displayName = "Steps";
StepsItem.displayName = "Steps.Item";
