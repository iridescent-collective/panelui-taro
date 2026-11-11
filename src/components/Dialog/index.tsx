import { View } from "@tarojs/components";
import {
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useMemo,
  useState,
} from "react";
import type { ComponentRef } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { DialogContent } from "./Content";
import { DialogContext, useDialog } from "./context";
import type {
  DialogProps,
  DialogTriggerProps,
  DialogCloseProps,
  DialogFooterProps,
  DialogTextProps,
} from "./types";
import { dialogFooterVariants } from "./variants";

export type {
  DialogProps,
  DialogContentProps,
  DialogFooterProps,
} from "./types";
const DialogRoot = ({
  children,
  open,
  onOpenChange,
  defaultOpen = false,
}: DialogProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = open !== undefined;
  const resolved = controlled ? open : internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlled, onOpenChange]
  );
  const context = useMemo(
    () => ({ open: resolved, setOpen }),
    [resolved, setOpen]
  );
  return (
    <DialogContext.Provider value={context}>{children}</DialogContext.Provider>
  );
};
const createDialogAction = (next: boolean) => {
  const Action = ({ children }: DialogTriggerProps | DialogCloseProps) => {
    const { setOpen } = useDialog(next ? "Dialog.Trigger" : "Dialog.Close");
    if (!isValidElement(children)) {
      return children;
    }
    const handler: NonNullable<
      DialogTriggerProps["children"]["props"]["onClick"]
    > = (event) => {
      (children.props.onClick ?? children.props.onPress)?.(event);
      setOpen(next);
    };
    return cloneElement(children, { onClick: handler, onPress: handler });
  };
  return Action;
};
const DialogTitle = forwardRef<ComponentRef<typeof Text>, DialogTextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      size="lg"
      weight="semibold"
      className={cn("text-[color:var(--panel-popover-foreground)]", className)}
      {...props}
    />
  )
);
const DialogDescription = forwardRef<
  ComponentRef<typeof Text>,
  DialogTextProps
>((props, ref) => <Text ref={ref} size="sm" muted {...props} />);
const DIALOG_PADDING = 20;
const DialogFooter = ({
  className,
  variant,
  style,
  ...props
}: DialogFooterProps) => (
  <View
    {...props}
    className={dialogFooterVariants({ className, variant })}
    style={
      variant === "panel"
        ? mergeStyle(
            {
              marginBottom: `${-DIALOG_PADDING * 2}rpx`,
              marginLeft: `${-DIALOG_PADDING * 2}rpx`,
              marginRight: `${-DIALOG_PADDING * 2}rpx`,
              paddingBottom: "32rpx",
              paddingLeft: `${DIALOG_PADDING * 2}rpx`,
              paddingRight: `${DIALOG_PADDING * 2}rpx`,
              paddingTop: "32rpx",
            },
            style
          )
        : style
    }
  />
);
export const Dialog = Object.assign(DialogRoot, {
  Close: createDialogAction(false),
  Content: DialogContent,
  Description: DialogDescription,
  Footer: DialogFooter,
  Title: DialogTitle,
  Trigger: createDialogAction(true),
});
