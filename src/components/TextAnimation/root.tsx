import { View } from "@tarojs/components";
import { useMemo } from "react";

import { cn } from "../../lib/utils";
import { TextAnimationContext } from "./context";
import type { TextAnimationProps } from "./types";

export const TextAnimationRoot = ({
  className,
  duration,
  delay,
  loop,
  enabled,
  children,
  ...props
}: TextAnimationProps) => {
  const value = useMemo(
    () => ({ delay, duration, enabled, loop }),
    [delay, duration, enabled, loop]
  );
  return (
    <TextAnimationContext.Provider value={value}>
      <View className={cn("flex flex-row items-center", className)} {...props}>
        {children}
      </View>
    </TextAnimationContext.Provider>
  );
};
TextAnimationRoot.displayName = "TextAnimation";
