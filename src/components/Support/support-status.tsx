import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { Text, textChildren } from "../primitives/Text";
import { AVAILABILITY_STATUS } from "./constants";
import { useSupport } from "./context";
import type { SupportStatusProps } from "./types";
import { supportVariants } from "./variants";

export const SupportStatus = forwardRef<
  ComponentRef<typeof View>,
  SupportStatusProps
>(
  (
    {
      className,
      availability: availabilityProp,
      replyTime,
      children,
      ...props
    },
    ref
  ) => {
    const { availability: inherited } = useSupport();
    const availability = availabilityProp ?? inherited;
    const { status, statusDot } = supportVariants({ availability });
    const fallback = AVAILABILITY_STATUS[availability];
    return (
      <View ref={ref} className={status({ className })} {...props}>
        <View className={statusDot()} />
        {children ? (
          textChildren(children)
        ) : (
          <Text size="sm" numberOfLines={2} className="shrink">
            {replyTime ?? fallback}
          </Text>
        )}
      </View>
    );
  }
);
SupportStatus.displayName = "Support.Status";
