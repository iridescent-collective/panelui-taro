import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { Text, textChildren } from "../primitives/Text";
import type { SupportResolutionProps } from "./types";
import { supportVariants } from "./variants";

export const SupportResolution = forwardRef<
  ComponentRef<typeof View>,
  SupportResolutionProps
>(({ className, title = "Did this solve it?", children, ...props }, ref) => {
  const { resolution } = supportVariants();
  return (
    <View ref={ref} className={resolution({ className })} {...props}>
      <Text size="sm" weight="medium">
        {title}
      </Text>
      {children ? (
        <View className="flex w-full flex-col items-center">
          {textChildren(children)}
        </View>
      ) : null}
    </View>
  );
});
SupportResolution.displayName = "Support.Resolution";
