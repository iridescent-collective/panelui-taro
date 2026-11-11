import { View } from "@tarojs/components";
import { Children, forwardRef, isValidElement } from "react";
import type { ComponentRef } from "react";

import { cn } from "../../lib/utils";
import type { KpiGroupProps } from "./types";
import { kpiVariants } from "./variants";

export const KpiGroup = forwardRef<ComponentRef<typeof View>, KpiGroupProps>(
  (
    {
      className,
      orientation = "horizontal",
      separated = true,
      children,
      ...props
    },
    ref
  ) => {
    const { group, groupSeparator } = kpiVariants();
    const horizontal = orientation === "horizontal";
    const visible = Children.toArray(children).filter(Boolean);
    return (
      <View
        ref={ref}
        className={cn(
          group(),
          horizontal ? "flex flex-row items-stretch" : "flex flex-col",
          !separated && "gap-[24px]",
          className
        )}
        {...props}
      >
        {visible.map((child, index) => (
          <View
            key={
              isValidElement(child)
                ? (child.key ?? String(child))
                : String(child)
            }
            className={cn(
              "relative",
              horizontal ? "min-w-0 flex-1" : "w-full",
              separated && horizontal && index > 0 && "ps-[32px]",
              separated &&
                horizontal &&
                index < visible.length - 1 &&
                "pe-[32px]",
              separated && !horizontal && index > 0 && "pt-[32px]",
              separated &&
                !horizontal &&
                index < visible.length - 1 &&
                "pb-[32px]"
            )}
          >
            {separated && index > 0 ? (
              <View
                aria-hidden
                className={cn(
                  groupSeparator(),
                  horizontal
                    ? "absolute start-0 top-0 bottom-0 w-[2px]"
                    : "absolute start-0 end-0 top-0 h-[2px]"
                )}
              />
            ) : null}
            {child}
          </View>
        ))}
      </View>
    );
  }
);
KpiGroup.displayName = "Kpi.Group";
