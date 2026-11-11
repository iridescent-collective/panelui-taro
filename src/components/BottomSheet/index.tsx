import { View } from "@tarojs/components";
import { cloneElement, isValidElement, useMemo } from "react";

import { cn } from "../../lib/utils";
import { useControllableState } from "../../primitives/controllable-state";
import { Text, textChildren } from "../primitives/Text";
import { BottomSheetBody } from "./body";
import { BottomSheetContent } from "./content";
import { BottomSheetContext, useBottomSheet } from "./context";
import type {
  BottomSheetProps,
  BottomSheetTriggerProps,
  BottomSheetHeaderProps,
  BottomSheetFooterProps,
} from "./types";

export { bottomSheetDetentHeight } from "./geometry";
export type {
  BottomSheetProps,
  BottomSheetTriggerProps,
  BottomSheetContentProps,
  BottomSheetHeaderProps,
  BottomSheetBodyProps,
  BottomSheetFooterProps,
} from "./types";
const BottomSheetRoot = ({
  children,
  open,
  onOpenChange,
  defaultOpen = false,
}: BottomSheetProps) => {
  const { value: resolved, setValue: setOpen } = useControllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: open,
  });
  const context = useMemo(
    () => ({ open: resolved, setOpen }),
    [resolved, setOpen]
  );
  return (
    <BottomSheetContext.Provider value={context}>
      {children}
    </BottomSheetContext.Provider>
  );
};
const BottomSheetTrigger = ({ children }: BottomSheetTriggerProps) => {
  const { setOpen } = useBottomSheet("BottomSheet.Trigger");
  if (!isValidElement(children)) {
    return children;
  }
  const press: typeof children.props.onClick = (event) => {
    (children.props.onClick ?? children.props.onPress)?.(event);
    setOpen(true);
  };
  return cloneElement(children, { onClick: press, onPress: press });
};
const BottomSheetHeader = ({
  className,
  title,
  description,
  children,
  ...props
}: BottomSheetHeaderProps) => (
  <View
    {...props}
    className={cn("flex flex-col gap-[8px] pe-[96px] pb-[24px]", className)}
  >
    {textChildren(title, (text) => (
      <Text size="lg" weight="semibold">
        {text}
      </Text>
    ))}
    {textChildren(description, (text) => (
      <Text size="sm" muted>
        {text}
      </Text>
    ))}
    {textChildren(children)}
  </View>
);
const BottomSheetFooter = ({
  className,
  children,
  ...props
}: BottomSheetFooterProps) => (
  <View
    {...props}
    className={cn(
      "flex flex-col gap-[16px] border-t-[2px] border-solid border-[var(--panel-border)] pt-[24px]",
      className
    )}
  >
    {textChildren(children)}
  </View>
);
export const BottomSheet = Object.assign(BottomSheetRoot, {
  Body: BottomSheetBody,
  Content: BottomSheetContent,
  Footer: BottomSheetFooter,
  Header: BottomSheetHeader,
  Trigger: BottomSheetTrigger,
});
