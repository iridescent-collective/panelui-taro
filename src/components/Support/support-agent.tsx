import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { Text } from "../primitives/Text";
import { AVAILABILITY_LABEL } from "./constants";
import { useSupport } from "./context";
import type { SupportAgentProps } from "./types";
import { supportVariants } from "./variants";

export const SupportAgent = forwardRef<
  ComponentRef<typeof View>,
  SupportAgentProps
>(
  (
    {
      className,
      avatar,
      name,
      role,
      availability: availabilityProp,
      typing = false,
      ...props
    },
    ref
  ) => {
    const { availability: inherited } = useSupport();
    const availability = availabilityProp ?? inherited;
    const { agent, statusDot } = supportVariants({ availability });
    const state = AVAILABILITY_LABEL[availability];
    const status = role ? `${role} · ${state}` : state;
    return (
      <View
        ref={ref}
        role="heading"
        aria-role="heading"
        aria-label={`${name}${role ? `, ${role}` : ""}, ${typing ? "typing" : state}`}
        className={agent({ className })}
        {...props}
      >
        {avatar ? <View className="shrink-0">{avatar}</View> : null}
        <View className="flex shrink grow flex-col gap-[4px]">
          <Text size="sm" weight="semibold" numberOfLines={1}>
            {name}
          </Text>
          <View className="flex flex-row items-center gap-[12px]">
            {typing ? null : <View className={statusDot()} />}
            <Text size="xs" muted numberOfLines={1}>
              {typing ? "Typing…" : status}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);
SupportAgent.displayName = "Support.Agent";
