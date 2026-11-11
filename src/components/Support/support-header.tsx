import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { Text, textChildren } from "../primitives/Text";
import type { SupportHeaderProps } from "./types";
import { supportVariants } from "./variants";

export const SupportHeader = forwardRef<
  ComponentRef<typeof View>,
  SupportHeaderProps
>(({ className, title, description, children, ...props }, ref) => {
  const { header, headerText } = supportVariants();
  return (
    <View ref={ref} className={header({ className })} {...props}>
      <View className={headerText()}>
        {title ? (
          <Text size="xl" weight="bold" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {description ? (
          <Text size="sm" muted numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      {children ? (
        <View className="shrink-0">{textChildren(children)}</View>
      ) : null}
    </View>
  );
});
SupportHeader.displayName = "Support.Header";
