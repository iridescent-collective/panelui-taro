import { View } from "@tarojs/components";
import { cloneElement, isValidElement, useEffect, useRef } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { cn } from "../../lib/utils";
import { textChildren } from "../primitives/Text";
import { useTooltip } from "./context";
import type { TooltipTriggerProps } from "./types";

export const TooltipTrigger = ({
  className,
  children,
}: TooltipTriggerProps) => {
  const { open, show, hide, trigger, setTrigger, openOn, label } =
    useTooltip("Tooltip.Trigger");
  const measured = useElementLayout(false, children);
  const mounted = useRef(true);
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
    let current = true;
    measured.refresh(
      () => current && mounted.current,
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
      current = false;
    };
  }, [open, trigger, setTrigger, measured.refresh]);
  const measureThenShow = () => {
    request.current += 1;
    const owner = request.current;
    measured.refresh(
      () => mounted.current && request.current === owner,
      (rect) => {
        if (rect) {
          setTrigger({
            height: rect.height,
            width: rect.width,
            x: rect.left,
            y: rect.top,
          });
          show();
        }
      }
    );
  };
  if (!isValidElement(children)) {
    return <>{textChildren(children)}</>;
  }
  const press: NonNullable<typeof children.props.onClick> = (event) => {
    (children.props.onClick ?? children.props.onPress)?.(event);
    if (openOn !== "press") {
      return;
    }
    if (open) {
      request.current += 1;
      hide();
    } else {
      measureThenShow();
    }
  };
  const longPress: NonNullable<typeof children.props.onLongPress> = (event) => {
    children.props.onLongPress?.(event);
    if (openOn === "longPress") {
      measureThenShow();
    }
  };
  const accessibleLabel =
    children.props.accessibilityLabel ?? children.props["aria-label"] ?? label;
  return (
    <View id={measured.id} className={cn("self-start", className)}>
      {cloneElement(children, {
        accessibilityLabel: accessibleLabel,
        "aria-label": accessibleLabel,
        onClick: press,
        onLongPress: longPress,
        onPress: press,
      })}
    </View>
  );
};
