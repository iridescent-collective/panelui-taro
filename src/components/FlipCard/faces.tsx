import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import type { FlipCardFaceProps } from "./types";

export const FlipCardFront = forwardRef<
  ComponentRef<typeof View>,
  FlipCardFaceProps
>(({ className, style, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    style={mergeStyle({ backfaceVisibility: "hidden" }, style)}
    className={cn("flex h-full w-full flex-col", className)}
  />
));
export const FlipCardBack = forwardRef<
  ComponentRef<typeof View>,
  FlipCardFaceProps
>(({ className, style, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    style={mergeStyle({ backfaceVisibility: "hidden" }, style)}
    className={cn("flex h-full w-full flex-col", className)}
  />
));
