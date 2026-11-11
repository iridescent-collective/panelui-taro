import { View } from "@tarojs/components";
import { Children, cloneElement, forwardRef, isValidElement } from "react";
import type { ComponentRef, ReactNode } from "react";

import { ChevronRightIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text, textChildren } from "../primitives/Text";
import type { FrameRowProps, FrameSectionProps } from "./types";

const DIVIDABLE = new Set<unknown>();
export const divideChildren = (children: ReactNode): ReactNode => {
  let seen = 0;
  return Children.map(children, (child) => {
    if (
      !isValidElement<{ divided?: boolean }>(child) ||
      !DIVIDABLE.has(child.type)
    ) {
      return child;
    }
    const index = seen;
    seen += 1;
    return child.props.divided === undefined
      ? cloneElement(child, { divided: index > 0 })
      : child;
  });
};

export const FrameRow = forwardRef<ComponentRef<typeof View>, FrameRowProps>(
  (
    {
      className,
      divided,
      chevron,
      wrap,
      align = "center",
      children,
      onPress,
      onClick,
      ...props
    },
    ref
  ) => {
    const press = onClick ?? onPress;
    const classes = cn(
      "flex flex-row gap-[24px] px-[32px] py-[28px]",
      align === "start" ? "items-start" : "items-center",
      wrap && "flex-wrap",
      divided && "border-t-[2px] border-solid border-[var(--panel-border)]",
      className
    );
    const body = (
      <>
        {textChildren(children)}
        {chevron ? <ChevronRightIcon size={16} /> : null}
      </>
    );
    if (!press) {
      return (
        <View {...props} ref={ref} className={classes}>
          {body}
        </View>
      );
    }
    return (
      <AnimatedPressable
        {...props}
        ref={ref}
        accessibilityRole="button"
        onPress={press}
        pressScale={1}
        pressOpacity={1}
        hoverClass="bg-[var(--panel-muted)]"
        className={classes}
      >
        {body}
      </AnimatedPressable>
    );
  }
);
export const FrameSection = forwardRef<
  ComponentRef<typeof View>,
  FrameSectionProps
>(({ className, title, divided, children, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    className={cn(
      "flex flex-col",
      divided && "border-t-[2px] border-solid border-[var(--panel-border)]",
      className
    )}
  >
    {title ? (
      <View className="bg-[var(--panel-muted-opacity-40)] px-[32px] pt-[20px] pb-[12px]">
        {typeof title === "string" ? (
          <Text
            size="xs"
            weight="medium"
            muted
            className="tracking-wider uppercase"
          >
            {title}
          </Text>
        ) : (
          title
        )}
      </View>
    ) : null}
    {divideChildren(children)}
  </View>
));

DIVIDABLE.add(FrameRow);
DIVIDABLE.add(FrameSection);
