import { View } from "@tarojs/components";
import { nextTick } from "@tarojs/taro";
import { useLayoutEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";

import { useElementLayout } from "../hooks/use-element-layout";
import { usePanelReducedMotion } from "../hooks/use-reduced-motion";
import { mergeStyle } from "../lib/styles";

export const COLLAPSE_DURATION = 200;
export interface CollapseProps extends ComponentProps<typeof View> {
  open: boolean;
  duration?: number;
  fade?: boolean;
  onExitComplete?: () => void;
}

export const Collapse = ({
  open,
  duration = COLLAPSE_DURATION,
  className,
  fade = true,
  onExitComplete,
  children,
  style,
  ...props
}: CollapseProps) => {
  const reducedMotion = usePanelReducedMotion();
  const measured = useElementLayout(true, children, props.id);
  const [targetOpen, setTargetOpen] = useState(open);
  const [animating, setAnimating] = useState(false);
  const [height, setHeight] = useState(0);
  const first = useRef(true);
  const { refresh } = measured;
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reducedMotion) {
      setTargetOpen(open);
      setAnimating(false);
      if (!open) onExitComplete?.();
      return;
    }
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    refresh(
      () => active,
      (layout) => {
        if (!layout) {
          setTargetOpen(open);
          setAnimating(false);
          if (!open) onExitComplete?.();
          return;
        }
        setHeight(layout.height);
        setAnimating(true);
        nextTick(() => {
          if (!active) {
            return;
          }
          setTargetOpen(open);
          timer = setTimeout(() => {
            if (active) {
              setAnimating(false);
              if (!open) onExitComplete?.();
            }
          }, duration);
        });
      }
    );
    return () => {
      active = false;
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, [open, reducedMotion, duration, refresh, onExitComplete]);
  const natural = targetOpen && !animating;
  return (
    <View
      style={
        natural
          ? { position: "relative" }
          : {
              height: `${targetOpen ? height * 2 : 0}rpx`,
              opacity: !fade || targetOpen ? 1 : 0,
              overflow: "hidden",
              position: "relative",
              transition: reducedMotion
                ? "none"
                : `height ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`,
            }
      }
    >
      <View
        {...props}
        id={measured.id}
        className={className}
        style={mergeStyle(
          natural ? {} : { left: 0, position: "absolute", right: 0, top: 0 },
          style
        )}
      >
        {children}
      </View>
    </View>
  );
};
Collapse.displayName = "Collapse";
