import type { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import type { SupportReplyProps } from "./types";
import { supportVariants } from "./variants";

export const SupportReply = forwardRef<
  ComponentRef<typeof View>,
  SupportReplyProps
>(
  (
    { className, value, label, disabled = false, onPress, onClick, ...props },
    ref
  ) => {
    const { reply } = supportVariants();
    return (
      <AnimatedPressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={label}
        disabled={disabled}
        onClick={(event) => {
          onPress?.(value ?? label);
          onClick?.(event);
        }}
        className={reply({ className })}
        {...props}
      >
        <Text size="xs" weight="medium" numberOfLines={1}>
          {label}
        </Text>
      </AnimatedPressable>
    );
  }
);
SupportReply.displayName = "Support.Reply";
