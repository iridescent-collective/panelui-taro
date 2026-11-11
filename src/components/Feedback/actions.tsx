import { View } from "@tarojs/components";
import { isValidElement } from "react";

import { XIcon } from "../../icons";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text, textChildren } from "../primitives/Text";
import { useFeedback } from "./context";
import type {
  FeedbackTriggerProps,
  FeedbackCloseProps,
  FeedbackActionProps,
  FeedbackSubmitProps,
} from "./types";
import { feedbackVariants } from "./variants";

export const FeedbackTrigger = ({ children }: FeedbackTriggerProps) => {
  const { setOpen } = useFeedback("Feedback.Trigger");
  if (!isValidElement(children)) {
    return children;
  }
  return (
    <AnimatedPressable
      pressScale={1}
      pressOpacity={1}
      onPress={() => setOpen(true)}
    >
      <View style={{ pointerEvents: "none" }}>{children}</View>
    </AnimatedPressable>
  );
};
export const FeedbackClose = ({
  className,
  label = "Close",
  onPress,
  onClick,
  style,
  ...props
}: FeedbackCloseProps) => {
  const { setOpen } = useFeedback("Feedback.Close");
  return (
    <AnimatedPressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={13}
      pressScale={1}
      pressOpacity={0.55}
      onClick={onClick ?? onPress ?? (() => setOpen(false))}
      className={feedbackVariants().close({ className })}
      style={
        typeof style === "string"
          ? `top:40rpx;right:40rpx;width:44rpx;height:44rpx;${style}`
          : {
              height: "44rpx",
              right: "40rpx",
              top: "40rpx",
              width: "44rpx",
              ...style,
            }
      }
    >
      <XIcon size={12} />
    </AnimatedPressable>
  );
};
const FeedbackAction = ({
  tone,
  className,
  labelClassName,
  disabled,
  onPress,
  onClick,
  children,
  ...props
}: FeedbackActionProps & { tone: "cancel" | "submit" }) => {
  const slots = feedbackVariants({ disabled: Boolean(disabled), tone });
  return (
    <AnimatedPressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      pressScale={0.97}
      pressOpacity={0.9}
      onClick={onClick ?? onPress}
      className={slots.action({ className })}
    >
      {textChildren(children, (label) => (
        <Text className={slots.actionLabel({ className: labelClassName })}>
          {label}
        </Text>
      ))}
    </AnimatedPressable>
  );
};
export const FeedbackCancel = ({
  children = "Cancel",
  onPress,
  ...props
}: FeedbackActionProps) => {
  const { setOpen } = useFeedback("Feedback.Cancel");
  return (
    <FeedbackAction
      tone="cancel"
      onPress={onPress ?? (() => setOpen(false))}
      {...props}
    >
      {children}
    </FeedbackAction>
  );
};
export const FeedbackSubmit = ({
  children = "Submit",
  disabled,
  onPress,
  onClick,
  onSubmit,
  ...props
}: FeedbackSubmitProps) => {
  const { value, fieldValue } = useFeedback("Feedback.Submit");
  const message = fieldValue ?? value;
  const empty = message.trim().length === 0;
  return (
    <FeedbackAction
      {...props}
      tone="submit"
      disabled={Boolean(disabled) || empty}
      onClick={(event) => {
        onPress?.();
        onClick?.(event);
        onSubmit?.(message);
      }}
    >
      {children}
    </FeedbackAction>
  );
};
