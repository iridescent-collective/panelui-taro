import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { STATUS_STYLE } from "./constants";
import type { SupportConversationProps } from "./types";
import { supportVariants } from "./variants";

export const SupportConversation = forwardRef<
  ComponentRef<typeof View>,
  SupportConversationProps
>(
  (
    {
      className,
      title,
      preview,
      status = "open",
      timestamp,
      unread = false,
      updated = false,
      reference,
      onPress,
      onClick,
      ...props
    },
    ref
  ) => {
    const { conversation, badge } = supportVariants();
    const tone = STATUS_STYLE[status];
    const update = updated ? "updated" : null;
    return (
      <AnimatedPressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={[
          title,
          tone.label,
          unread ? "unread" : update,
          timestamp,
        ]
          .filter(Boolean)
          .join(", ")}
        disabled={!onPress && !onClick}
        onClick={onClick ?? onPress}
        className={conversation({ className })}
        {...props}
      >
        {unread || updated ? (
          <View
            className={cn(
              "mt-[12px] size-[16px] shrink-0 rounded-full",
              unread
                ? "bg-[var(--panel-primary)]"
                : "bg-[var(--panel-muted-foreground)]"
            )}
          />
        ) : null}
        <View className="flex shrink grow flex-col gap-[8px]">
          <View className="flex flex-row items-baseline gap-[16px]">
            <Text
              size="sm"
              weight={unread ? "semibold" : "medium"}
              numberOfLines={1}
              className="shrink grow"
            >
              {title}
            </Text>
            {timestamp ? (
              <Text size="xs" muted numberOfLines={1} className="shrink-0">
                {timestamp}
              </Text>
            ) : null}
          </View>
          {preview ? (
            <Text size="xs" muted numberOfLines={2}>
              {preview}
            </Text>
          ) : null}
          <View className="flex flex-row items-center gap-[16px] pt-[4px]">
            <View className={badge({ className: tone.className })}>
              <Text size="xs" weight="medium" className={tone.textClassName}>
                {tone.label}
              </Text>
            </View>
            {reference ? (
              <Text size="xs" muted numberOfLines={1}>
                {reference}
              </Text>
            ) : null}
          </View>
        </View>
      </AnimatedPressable>
    );
  }
);
SupportConversation.displayName = "Support.Conversation";
