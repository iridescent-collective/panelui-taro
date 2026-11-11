import { View } from "@tarojs/components";
import { forwardRef, useContext } from "react";
import type { ComponentRef } from "react";

import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { TopicsContext } from "./context";
import type { SupportTopicProps } from "./types";
import { supportVariants } from "./variants";

export const SupportTopic = forwardRef<
  ComponentRef<typeof View>,
  SupportTopicProps
>(
  (
    {
      className,
      value,
      icon,
      label,
      description,
      disabled = false,
      onPress,
      onClick,
      ...props
    },
    ref
  ) => {
    const group = useContext(TopicsContext);
    const selected = group?.value === value;
    const { topic, topicText, channelIcon } = supportVariants({
      disabled,
      selected,
    });
    return (
      <AnimatedPressable
        ref={ref}
        accessibilityRole="radio"
        accessibilityState={{ disabled, selected }}
        accessibilityLabel={label}
        accessibilityHint={description}
        disabled={disabled}
        onClick={(event) => {
          group?.select(value);
          if (onClick) {
            onClick(event);
          } else {
            onPress?.();
          }
        }}
        className={topic({ className })}
        {...props}
      >
        {icon ? <View className={channelIcon()}>{icon}</View> : null}
        <View className={topicText()}>
          <Text size="sm" weight="medium" numberOfLines={1}>
            {label}
          </Text>
          {description ? (
            <Text size="xs" muted numberOfLines={2}>
              {description}
            </Text>
          ) : null}
        </View>
      </AnimatedPressable>
    );
  }
);
SupportTopic.displayName = "Support.Topic";
