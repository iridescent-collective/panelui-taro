import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { Text } from "../primitives/Text";
import type { SupportHandoffProps } from "./types";
import { supportVariants } from "./variants";

export const SupportHandoff = forwardRef<
  ComponentRef<typeof View>,
  SupportHandoffProps
>(({ className, icon, children, ...props }, ref) => {
  const { handoff } = supportVariants();
  return (
    <View
      ref={ref}
      role="alert"
      aria-role="alert"
      className={handoff({ className })}
      {...props}
    >
      {icon ? <View className="shrink-0">{icon}</View> : null}

      <Text size="xs" muted className="shrink">
        {children}
      </Text>
    </View>
  );
});
SupportHandoff.displayName = "Support.Handoff";
