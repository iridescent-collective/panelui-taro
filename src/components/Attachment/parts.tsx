import type { View } from "@tarojs/components";
import { forwardRef, useContext } from "react";
import type { ComponentRef } from "react";

import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Item } from "../Item";
import type { Text } from "../primitives/Text";
import { textChildren } from "../primitives/Text";
import { Shimmer } from "../Shimmer";
import { AttachmentContext, isAttachmentBusy } from "./context";
import type {
  AttachmentGroupProps,
  AttachmentMediaProps,
  AttachmentContentProps,
  AttachmentTitleProps,
  AttachmentDescriptionProps,
  AttachmentActionsProps,
  AttachmentActionProps,
} from "./types";

export const AttachmentGroup = forwardRef<
  ComponentRef<typeof View>,
  AttachmentGroupProps
>(({ className, orientation = "vertical", children, ...props }, ref) => (
  <Item.Group
    {...props}
    ref={ref}
    orientation={orientation}
    className={className}
  >
    {children}
  </Item.Group>
));
export const AttachmentMedia = forwardRef<
  ComponentRef<typeof View>,
  AttachmentMediaProps
>(({ className, variant = "icon", children, ...props }, ref) => (
  <Item.Media {...props} ref={ref} variant={variant} className={className}>
    {children}
  </Item.Media>
));
export const AttachmentContent = forwardRef<
  ComponentRef<typeof View>,
  AttachmentContentProps
>(({ className, children, ...props }, ref) => (
  <Item.Content {...props} ref={ref} className={className}>
    {children}
  </Item.Content>
));
export const AttachmentTitle = forwardRef<
  ComponentRef<typeof Text>,
  AttachmentTitleProps
>(({ className, children, ...props }, ref) => {
  const { state } = useContext(AttachmentContext);
  if (isAttachmentBusy(state)) {
    return (
      <Shimmer textClassName={cn("text-[32px] font-medium", className)}>
        {children}
      </Shimmer>
    );
  }
  return (
    <Item.Title
      {...props}
      ref={ref}
      className={cn(
        state === "error" && "text-[color:var(--panel-destructive)]",
        className
      )}
    >
      {children}
    </Item.Title>
  );
});
export const AttachmentDescription = forwardRef<
  ComponentRef<typeof Text>,
  AttachmentDescriptionProps
>(({ className, children, ...props }, ref) => {
  const { state } = useContext(AttachmentContext);
  return (
    <Item.Description
      {...props}
      ref={ref}
      className={cn(
        state === "error" && "text-[color:var(--panel-destructive)]",
        className
      )}
    >
      {children}
    </Item.Description>
  );
});
export const AttachmentActions = forwardRef<
  ComponentRef<typeof View>,
  AttachmentActionsProps
>(({ className, children, ...props }, ref) => (
  <Item.Actions {...props} ref={ref} className={className}>
    {children}
  </Item.Actions>
));
export const AttachmentAction = forwardRef<
  ComponentRef<typeof View>,
  AttachmentActionProps
>(
  (
    { className, accessibilityLabel, children, onClick, onPress, ...props },
    ref
  ) => (
    <AnimatedPressable
      {...props}
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onClick={(event) => {
        event.stopPropagation();
        (onClick ?? onPress)?.(event);
      }}
      hitSlop={8}
      className={cn(
        "flex h-[64px] w-[64px] items-center justify-center rounded-full active:bg-[var(--panel-muted)]",
        className
      )}
    >
      {textChildren(children)}
    </AnimatedPressable>
  )
);
