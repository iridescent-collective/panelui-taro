import {
  cloneElement,
  isValidElement,
  useCallback,
  useMemo,
  useState,
} from "react";

import { DrawerContext, useDrawer } from "./context";
import type {
  DrawerProps,
  DrawerTriggerProps,
  DrawerCloseProps,
} from "./types";

export const DrawerRoot = ({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
}: DrawerProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const controlled = controlledOpen !== undefined;
  const open = controlled ? controlledOpen : uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlled, onOpenChange]
  );
  const context = useMemo(() => ({ open, setOpen }), [open, setOpen]);
  return (
    <DrawerContext.Provider value={context}>{children}</DrawerContext.Provider>
  );
};
const createDrawerAction = (next: boolean) => {
  const Action = ({ children }: DrawerTriggerProps | DrawerCloseProps) => {
    const { setOpen } = useDrawer(next ? "Drawer.Trigger" : "Drawer.Close");
    if (!isValidElement(children)) {
      return children;
    }
    const handler: NonNullable<
      DrawerTriggerProps["children"]["props"]["onClick"]
    > = (event) => {
      (children.props.onClick ?? children.props.onPress)?.(event);
      setOpen(next);
    };
    return cloneElement(children, { onClick: handler, onPress: handler });
  };
  return Action;
};
export const DrawerTrigger = createDrawerAction(true);
export const DrawerClose = createDrawerAction(false);
