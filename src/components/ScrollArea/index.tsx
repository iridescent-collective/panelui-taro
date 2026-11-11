import { ScrollView, View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentProps, ComponentRef, CSSProperties } from "react";

import { cn } from "../../lib/utils";

export interface ScrollAreaProps extends Omit<
  ComponentProps<typeof ScrollView>,
  "scrollX" | "scrollY"
> {
  orientation?: "vertical" | "horizontal";
  contentContainerClassName?: string;
  contentContainerStyle?: CSSProperties;
}

export const ScrollArea = forwardRef<
  ComponentRef<typeof ScrollView>,
  ScrollAreaProps
>(
  (
    {
      orientation = "vertical",
      contentContainerClassName,
      contentContainerStyle,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <ScrollView
      {...props}
      ref={ref}
      scrollY={orientation === "vertical"}
      scrollX={orientation === "horizontal"}
      className={cn("min-h-0 min-w-0", className)}
    >
      <View className={contentContainerClassName} style={contentContainerStyle}>
        {children}
      </View>
    </ScrollView>
  )
);
ScrollArea.displayName = "ScrollArea";
