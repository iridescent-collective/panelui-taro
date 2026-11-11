import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef, ComponentProps } from "react";

import { cn } from "../../lib/utils";
import { textChildren } from "../primitives/Text";
import type { SURFACE_PADDING, SURFACE_VARIANT } from "./constants";
import { surfaceVariants } from "./variants";

export interface SurfaceProps extends ComponentProps<typeof View> {
  variant?: keyof typeof SURFACE_VARIANT;
  padding?: keyof typeof SURFACE_PADDING;
  bordered?: boolean;
  elevated?: boolean;
}

export const Surface = forwardRef<ComponentRef<typeof View>, SurfaceProps>(
  (
    {
      variant = "default",
      padding = "default",
      bordered,
      elevated,
      className,
      children,
      ...props
    }: SurfaceProps,
    ref
  ) => (
    <View
      ref={ref}
      {...props}
      className={surfaceVariants({
        bordered,
        className: cn("flex flex-col", className),
        elevated,
        padding,
        variant,
      })}
    >
      {textChildren(children)}
    </View>
  )
);
