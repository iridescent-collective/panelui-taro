import { View } from "@tarojs/components";
import { cloneElement, isValidElement, useEffect, useRef } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePopover } from "./context";
import type { PopoverTriggerProps, PopoverCloseProps } from "./types";

export const PopoverTrigger = ({ children }: PopoverTriggerProps) => {
  const { open, trigger, setOpen, setTrigger } = usePopover("Popover.Trigger");
  const measured = useElementLayout(false, children);
  const mounted = useRef(false);
  const request = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current += 1;
    };
  }, []);
  useEffect(() => {
    if (!open || trigger) {
      return;
    }
    let active = true;
    measured.refresh(
      () => active && mounted.current,
      (rect) => {
        if (rect) {
          setTrigger({
            height: rect.height,
            width: rect.width,
            x: rect.left,
            y: rect.top,
          });
        }
      }
    );
    return () => {
      active = false;
    };
  }, [open, trigger, setTrigger, measured.refresh]);
  if (!isValidElement(children)) {
    return children;
  }
  const press: typeof children.props.onClick = (event) => {
    (children.props.onClick ?? children.props.onPress)?.(event);
    request.current += 1;
    const owner = request.current;
    if (open) {
      setOpen(false);
      return;
    }
    measured.refresh(
      () => mounted.current && request.current === owner,
      (rect) => {
        if (!rect) {
          return;
        }
        setTrigger({
          height: rect.height,
          width: rect.width,
          x: rect.left,
          y: rect.top,
        });
        setOpen(true);
      }
    );
  };
  return (
    <View id={measured.id}>
      {cloneElement(children, { onClick: press, onPress: press })}
    </View>
  );
};
export const PopoverClose = ({ children }: PopoverCloseProps) => {
  const { setOpen } = usePopover("Popover.Close");
  if (!isValidElement(children)) {
    return children;
  }
  const press: typeof children.props.onClick = (event) => {
    (children.props.onClick ?? children.props.onPress)?.(event);
    setOpen(false);
  };
  return cloneElement(children, { onClick: press, onPress: press });
};
