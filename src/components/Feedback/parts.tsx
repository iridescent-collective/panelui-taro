import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import type { FeedbackPanelProps, FeedbackFooterProps } from "./types";
import { feedbackVariants } from "./variants";

export const FeedbackPanel = forwardRef<
  ComponentRef<typeof View>,
  FeedbackPanelProps
>(({ className, children, style, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    className={cn(
      feedbackVariants().panel(),
      "relative flex flex-col gap-[32px] p-[40px]",
      className
    )}
    style={mergeStyle({ borderRadius: "60rpx" }, style)}
  >
    {textChildren(children)}
  </View>
));
export const FeedbackTitle = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      {...props}
      className={feedbackVariants().title({ className })}
    />
  )
);
export const FeedbackFooter = forwardRef<
  ComponentRef<typeof View>,
  FeedbackFooterProps
>(({ className, children, style, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    className={feedbackVariants().footer({ className })}
    style={mergeStyle(
      { marginLeft: "36rpx", marginRight: "36rpx", marginTop: "32rpx" },
      style
    )}
  >
    {children}
  </View>
));
