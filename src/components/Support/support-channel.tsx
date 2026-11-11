import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import type { SupportChannelProps } from "./types";
import { supportVariants } from "./variants";

export const SupportChannel = forwardRef<
  ComponentRef<typeof View>,
  SupportChannelProps
>(
  (
    {
      className,
      icon,
      label,
      description,
      detail,
      disabled = false,
      onPress,
      onClick,
      ...props
    },
    ref
  ) => {
    const { channel, channelIcon, channelText } = supportVariants({ disabled });
    return (
      <AnimatedPressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={detail ? `${label}, ${detail}` : label}
        accessibilityHint={description}
        disabled={disabled || (!onPress && !onClick)}
        onClick={onClick ?? onPress}
        className={channel({ className })}
        {...props}
      >
        {icon ? <View className={channelIcon()}>{icon}</View> : null}
        <View className={channelText()}>
          <Text size="sm" weight="medium" numberOfLines={1}>
            {label}
          </Text>
          {description ? (
            <Text size="xs" muted numberOfLines={2}>
              {description}
            </Text>
          ) : null}
        </View>
        {detail ? (
          <Text size="xs" muted numberOfLines={1} className="shrink-0">
            {detail}
          </Text>
        ) : null}
      </AnimatedPressable>
    );
  }
);
SupportChannel.displayName = "Support.Channel";
