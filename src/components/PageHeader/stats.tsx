import { View } from "@tarojs/components";
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useContext,
} from "react";
import type { ComponentRef } from "react";

import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { PageHeaderStatsContext, usePageHeader } from "./context";
import type { PageHeaderStatsProps, PageHeaderStatProps } from "./types";
import { pageHeaderVariants } from "./variants";

export const PageHeaderStat = forwardRef<
  ComponentRef<typeof View>,
  PageHeaderStatProps
>(
  (
    {
      className,
      value,
      label,
      divided,
      onPress,
      onClick,
      accessibilityLabel,
      ...props
    },
    ref
  ) => {
    const inline = useContext(PageHeaderStatsContext) === "inline";
    const speakable =
      (typeof value === "string" || typeof value === "number") &&
      (typeof label === "string" || typeof label === "number");
    const spoken =
      accessibilityLabel ??
      props["aria-label"] ??
      (speakable ? `${value} ${label}` : undefined);
    const classes = cn(
      inline
        ? "flex flex-row items-center gap-[8px]"
        : "flex flex-col items-center gap-[4px]",
      divided &&
        "border-s-[2px] border-solid border-[var(--panel-border)] ps-[32px]",
      className
    );
    const body = (
      <>
        <Text size="sm" weight="semibold">
          {value}
        </Text>
        <Text size="sm" muted>
          {label}
        </Text>
      </>
    );
    if (!onClick && !onPress) {
      return (
        <View {...props} ref={ref} aria-label={spoken} className={classes}>
          {body}
        </View>
      );
    }
    return (
      <AnimatedPressable
        {...props}
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={spoken}
        onClick={onClick ?? onPress}
        className={classes}
      >
        {body}
      </AnimatedPressable>
    );
  }
);

export const PageHeaderStats = forwardRef<
  ComponentRef<typeof View>,
  PageHeaderStatsProps
>(({ className, layout = "stacked", divided, children, ...props }, ref) => {
  const { variant, align } = usePageHeader("PageHeader.Stats");
  const stacked = layout === "stacked";
  const measured = stacked && align === "center";
  const items =
    divided || measured
      ? Children.map(children, (child, index) => {
          if (
            !isValidElement<PageHeaderStatProps>(child) ||
            child.type !== PageHeaderStat
          ) {
            return child;
          }
          const next: Partial<PageHeaderStatProps> = {};
          if (divided && child.props.divided === undefined) {
            next.divided = index > 0;
          }
          if (measured) {
            next.className = cn("flex-1", child.props.className);
          }
          return cloneElement(child, next);
        })
      : children;
  return (
    <View
      {...props}
      ref={ref}
      className={pageHeaderVariants({ align, variant }).stats({
        className: cn(
          stacked ? "gap-[48px]" : "gap-[32px]",
          measured && "w-full",
          className
        ),
      })}
    >
      <PageHeaderStatsContext.Provider value={layout}>
        {items}
      </PageHeaderStatsContext.Provider>
    </View>
  );
});
