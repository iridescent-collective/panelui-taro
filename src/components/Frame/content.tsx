import { View } from "@tarojs/components";
import { forwardRef, useContext } from "react";
import type { ComponentRef } from "react";

import { cn } from "../../lib/utils";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { FrameSlotContext, FrameVariantContext } from "./context";
import type {
  FrameHeaderProps,
  FrameActionProps,
  FrameMediaProps,
  FrameContentProps,
  FrameActionsProps,
} from "./types";
import { frameVariants } from "./variants";

export const FrameHeader = forwardRef<
  ComponentRef<typeof View>,
  FrameHeaderProps
>(({ className, children, ...props }, ref) => {
  const variant = useContext(FrameVariantContext);
  return (
    <View
      {...props}
      ref={ref}
      className={frameVariants({ variant }).header({ className })}
    >
      {textChildren(children)}
    </View>
  );
});
export const FrameTitle = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => {
    const inRow = useContext(FrameSlotContext);
    return inRow ? (
      <Text
        ref={ref}
        size="sm"
        weight="medium"
        numberOfLines={1}
        className={className}
        {...props}
      />
    ) : (
      <Text
        ref={ref}
        size="sm"
        muted
        className={cn("min-w-0 shrink", className)}
        {...props}
      />
    );
  }
);
export const FrameDescription = forwardRef<
  ComponentRef<typeof Text>,
  TextProps
>((props, ref) => {
  const inRow = useContext(FrameSlotContext);
  return (
    <Text
      ref={ref}
      size={inRow ? "xs" : "sm"}
      muted
      numberOfLines={inRow ? 2 : undefined}
      {...props}
    />
  );
});
export const FrameAction = forwardRef<
  ComponentRef<typeof View>,
  FrameActionProps
>(({ className, children, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    className={cn("flex shrink-0 flex-row items-center gap-[16px]", className)}
  >
    {textChildren(children, (text) => (
      <Text size="sm" muted>
        {text}
      </Text>
    ))}
  </View>
));
export const FrameMedia = forwardRef<
  ComponentRef<typeof View>,
  FrameMediaProps
>(({ className, children, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    className={cn(
      "flex shrink-0 flex-col items-center justify-center",
      className
    )}
  >
    {textChildren(children)}
  </View>
));
export const FrameContent = forwardRef<
  ComponentRef<typeof View>,
  FrameContentProps
>(({ className, children, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    className={cn("flex min-w-0 flex-1 flex-col gap-[4px]", className)}
  >
    <FrameSlotContext.Provider value>
      {textChildren(children)}
    </FrameSlotContext.Provider>
  </View>
));
export const FrameActions = forwardRef<
  ComponentRef<typeof View>,
  FrameActionsProps
>(({ className, children, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    className={cn("flex shrink-0 flex-row items-center gap-[12px]", className)}
  >
    {textChildren(children)}
  </View>
));
