import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef, ComponentProps } from "react";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";

import { Text, textChildren } from "../primitives/Text";
import { badgeVariants } from "./variants";

export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>["size"]>;
export interface BadgeProps
  extends ComponentProps<typeof View>, VariantProps<typeof badgeVariants> {
  count?: number;
  labelClassName?: string;
}
const BADGE_MAX_COUNT = 99;

export const Badge = forwardRef<ComponentRef<typeof View>, BadgeProps>(
  (
    {
      variant = "default",
      size = "md",
      shape,
      count,
      className,
      labelClassName,
      children,
      ...props
    }: BadgeProps,
    ref
  ) => {
    const resolvedShape = shape ?? (count === undefined ? "default" : "count");
    const content =
      count === undefined
        ? children
        : `${Math.min(count, BADGE_MAX_COUNT)}${count > BADGE_MAX_COUNT ? "+" : ""}`;
    const slots = badgeVariants({ shape: resolvedShape, size, variant });
    return (
      <View
        ref={ref}
        aria-label={count === undefined ? undefined : `${count} unread`}
        {...props}
        className={slots.root({ className })}
      >
        {resolvedShape === "dot"
          ? null
          : textChildren(content, (value) => (
              <Text className={slots.label({ className: labelClassName })}>
                {value}
              </Text>
            ))}
      </View>
    );
  }
);
