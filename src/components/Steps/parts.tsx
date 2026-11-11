import { View } from "@tarojs/components";
import { forwardRef, useContext } from "react";
import type { ComponentRef } from "react";

import { CheckIcon } from "../../icons";
import { AnimatedPressable as Pressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { Spinner } from "../Spinner";
import { useSteps, useStepItem, StepPositionContext } from "./context";
import { stepsTriggerDisabled } from "./steps-trigger";
import type {
  StepState,
  StepsTriggerProps,
  StepsIndicatorProps,
  StepsSeparatorProps,
} from "./types";
import { stepsVariants } from "./variants";

const STATE_WORDS: Record<StepState, string> = {
  active: "current step",
  completed: "completed",
  inactive: "not started",
  loading: "in progress",
};
export const StepsTrigger = forwardRef<
  ComponentRef<typeof View>,
  StepsTriggerProps
>(
  (
    {
      className,
      children,
      disabled,
      onClick,
      onPress,
      accessibilityState,
      accessibilityValue,
      ...props
    },
    ref
  ) => {
    const { setActiveStep, orientation } = useSteps("Steps.Trigger");
    const { step, state, isDisabled } = useStepItem("Steps.Trigger");
    const placement = useContext(StepPositionContext);
    const triggerDisabled = stepsTriggerDisabled(isDisabled, disabled);
    const { trigger } = stepsVariants({
      isDisabled: triggerDisabled,
      orientation,
      state,
    });
    const position = placement
      ? `step ${placement.position + 1} of ${placement.total}, ${STATE_WORDS[state]}`
      : STATE_WORDS[state];
    return (
      <Pressable
        ref={ref}
        {...props}
        accessibilityRole="button"
        accessibilityState={{
          ...accessibilityState,
          disabled: triggerDisabled,
          selected: state === "active",
        }}
        aria-valuetext={accessibilityValue?.text ?? position}
        disabled={triggerDisabled}
        onClick={(event) => {
          (onClick ?? onPress)?.(event);
          setActiveStep(step);
        }}
        className={trigger({ className })}
      >
        {textChildren(children)}
      </Pressable>
    );
  }
);
export const StepsIndicator = forwardRef<
  ComponentRef<typeof View>,
  StepsIndicatorProps
>(({ className, children, ...props }, ref) => {
  const { orientation } = useSteps("Steps.Indicator");
  const { step, state, isLoading } = useStepItem("Steps.Indicator");
  const { indicator, indicatorLabel } = stepsVariants({ orientation, state });
  const checkColor = useThemeToken("primary-foreground");
  let fallback = <Text className={indicatorLabel()}>{step + 1}</Text>;
  if (isLoading) {
    fallback = <Spinner size="sm" />;
  } else if (state === "completed") {
    fallback = <CheckIcon size={14} color={checkColor} />;
  }
  return (
    <View
      ref={ref}
      className={indicator({ className: `flex flex-col ${className ?? ""}` })}
      {...props}
    >
      {children ?? fallback}
    </View>
  );
});
export const StepsTitle = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => {
    const { orientation } = useSteps("Steps.Title");
    const { state } = useStepItem("Steps.Title");
    const { title } = stepsVariants({ orientation, state });
    return <Text ref={ref} className={title({ className })} {...props} />;
  }
);
export const StepsDescription = forwardRef<
  ComponentRef<typeof Text>,
  TextProps
>(({ className, ...props }, ref) => {
  const { orientation } = useSteps("Steps.Description");
  const { state } = useStepItem("Steps.Description");
  const { description } = stepsVariants({ orientation, state });
  return <Text ref={ref} className={description({ className })} {...props} />;
});
export const StepsSeparator = forwardRef<
  ComponentRef<typeof View>,
  StepsSeparatorProps
>(({ className, ...props }, ref) => {
  const { orientation } = useSteps("Steps.Separator");
  const { state } = useStepItem("Steps.Separator");
  const { separator } = stepsVariants({ orientation, state });
  return (
    <View
      ref={ref}
      aria-hidden
      className={separator({ className })}
      {...props}
    />
  );
});
StepsTrigger.displayName = "Steps.Trigger";
StepsIndicator.displayName = "Steps.Indicator";
StepsTitle.displayName = "Steps.Title";
StepsDescription.displayName = "Steps.Description";
StepsSeparator.displayName = "Steps.Separator";
