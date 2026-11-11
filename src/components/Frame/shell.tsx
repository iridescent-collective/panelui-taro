import { View } from "@tarojs/components";
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useContext,
} from "react";
import type { ComponentRef, ReactNode } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { textChildren } from "../primitives/Text";
import { FrameVariantContext } from "./context";
import { divideChildren } from "./rows";
import type {
  FrameRootProps,
  FramePanelProps,
  FrameFooterProps,
} from "./types";
import { frameVariants } from "./variants";

const INSET_ROOT = { borderRadius: "76rpx", padding: "16rpx" };
const INSET_PANEL = { borderRadius: "60rpx" };
const INSET_FOOTER = {
  marginLeft: "36rpx",
  marginRight: "36rpx",
  marginTop: "32rpx",
};
const pillChildren = (children: ReactNode): ReactNode =>
  Children.map(children, (child) =>
    isValidElement<{ className?: string }>(child)
      ? cloneElement(child, {
          className: cn("h-[88px] flex-1 rounded-full", child.props.className),
        })
      : child
  );

export const FrameRoot = forwardRef<ComponentRef<typeof View>, FrameRootProps>(
  ({ className, variant = "default", children, style, ...props }, ref) => {
    const slots = frameVariants({ variant });
    const inset = variant === "inset";
    return (
      <View
        {...props}
        ref={ref}
        className={cn("relative flex flex-col", slots.root({ className }))}
        style={inset ? mergeStyle(INSET_ROOT, style) : style}
      >
        {inset ? (
          <View
            aria-hidden
            style={{ pointerEvents: "none" }}
            className={slots.recess()}
          />
        ) : null}
        <FrameVariantContext.Provider value={variant}>
          {textChildren(children)}
        </FrameVariantContext.Provider>
      </View>
    );
  }
);
export const FramePanel = forwardRef<
  ComponentRef<typeof View>,
  FramePanelProps
>(({ className, dividers = true, children, style, ...props }, ref) => {
  const variant = useContext(FrameVariantContext);
  return (
    <View
      {...props}
      ref={ref}
      className={cn(
        "relative flex flex-col",
        frameVariants({ variant }).panel({ className })
      )}
      style={variant === "inset" ? mergeStyle(INSET_PANEL, style) : style}
    >
      {textChildren(dividers ? divideChildren(children) : children)}
    </View>
  );
});
export const FrameFooter = forwardRef<
  ComponentRef<typeof View>,
  FrameFooterProps
>(({ className, style, children, ...props }, ref) => {
  const variant = useContext(FrameVariantContext);
  const inset = variant === "inset";
  return (
    <View
      {...props}
      ref={ref}
      className={cn(
        "relative",
        frameVariants({ variant }).footer({ className })
      )}
      style={inset ? mergeStyle(INSET_FOOTER, style) : style}
    >
      {textChildren(inset ? pillChildren(children) : children)}
    </View>
  );
});
