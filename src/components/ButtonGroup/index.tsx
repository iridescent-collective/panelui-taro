import { View } from "@tarojs/components";
import { forwardRef, Children, Fragment, useMemo } from "react";
import type { ComponentRef, ComponentProps } from "react";

import { cn } from "../../lib/utils";
import type { ButtonProps } from "../Button";
import { ButtonGroupContext } from "../Button/context";
import { buttonGroupVariants } from "./variants";

export type ButtonGroupOrientation = "horizontal" | "vertical";

export interface ButtonGroupProps extends ComponentProps<typeof View> {
  orientation?: ButtonGroupOrientation;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  attached?: boolean;
  fullWidth?: boolean;
}

export const ButtonGroup = forwardRef<
  ComponentRef<typeof View>,
  ButtonGroupProps
>(
  (
    {
      orientation = "horizontal",
      variant,
      size = "md",
      attached = true,
      fullWidth = false,
      className,
      children,
      ...props
    }: ButtonGroupProps,
    ref
  ) => {
    const value = useMemo(
      () => ({ attached, fullWidth, size, variant }),
      [variant, size, attached, fullWidth]
    );
    const items = Children.toArray(children);
    const slots = buttonGroupVariants({
      attached,
      fullWidth,
      orientation,
      size,
    });
    return (
      <ButtonGroupContext.Provider value={value}>
        <View
          ref={ref}
          {...props}
          role="toolbar"
          aria-role="toolbar"
          className={slots.root({ className: `flex ${className ?? ""}` })}
        >
          {items.map((child, index) => (
            <Fragment
              key={
                typeof child === "object" && "key" in child
                  ? child.key
                  : `segment-${index}`
              }
            >
              {attached && index > 0 ? (
                <View
                  data-panel-divider="true"
                  aria-hidden
                  className={cn(
                    "shrink-0 self-stretch bg-[var(--panel-border)]",
                    orientation === "horizontal" ? "w-[2px]" : "h-[2px]"
                  )}
                />
              ) : null}
              {fullWidth ? (
                <View
                  data-panel-segment="true"
                  className="flex min-w-0 flex-1 items-stretch"
                >
                  {child}
                </View>
              ) : (
                child
              )}
            </Fragment>
          ))}
        </View>
      </ButtonGroupContext.Provider>
    );
  }
);
