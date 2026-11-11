import { View } from "@tarojs/components";
import { forwardRef, useContext } from "react";
import type { ComponentRef } from "react";

import { IconColorProvider } from "../../icons";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { Shimmer } from "../Shimmer";
import { MarkerContext } from "./context";
import type { MarkerIconProps, MarkerContentProps } from "./types";
import { markerVariants } from "./variants";

export const MarkerIcon = forwardRef<
  ComponentRef<typeof View>,
  MarkerIconProps
>(({ className, children, ...props }, ref) => {
  const muted = useThemeToken("muted-foreground");
  return (
    <View
      {...props}
      ref={ref}
      aria-hidden
      className={cn(
        "flex h-[32px] w-[32px] shrink-0 items-center justify-center",
        className
      )}
    >
      <IconColorProvider color={muted}>
        {textChildren(children)}
      </IconColorProvider>
    </View>
  );
});
export const MarkerContent = forwardRef<
  ComponentRef<typeof Text>,
  MarkerContentProps
>(({ className, shimmer, children, ...props }, ref) => {
  const variant = useContext(MarkerContext);
  const { content } = markerVariants({ variant });
  if (shimmer) {
    return <Shimmer textClassName={content({ className })}>{children}</Shimmer>;
  }
  return (
    <Text {...props} ref={ref} className={content({ className })}>
      {children}
    </Text>
  );
});
