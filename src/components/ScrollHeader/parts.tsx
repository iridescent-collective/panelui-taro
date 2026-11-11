import { View } from "@tarojs/components";
import { forwardRef, useContext, useEffect, useMemo, useRef } from "react";
import type { ComponentRef } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import {
  ScrollHeaderSlotContext,
  useHeaderNumber,
  useScrollHeader,
} from "./context";
import {
  BAR_TITLE_ARRIVE,
  LARGE_EXIT,
  SURFACE_ARRIVE,
  rampOpacity,
} from "./math";
import type {
  ScrollHeaderActionsProps,
  ScrollHeaderBarProps,
  ScrollHeaderLargeProps,
} from "./types";
import { scrollHeaderVariants } from "./variants";

const BarSurface = ({
  surface,
  divider,
}: Pick<ScrollHeaderBarProps, "surface" | "divider">) => {
  const { progress } = useScrollHeader("ScrollHeader.Bar");
  const value = useHeaderNumber(progress);
  const slots = scrollHeaderVariants({
    divider,
    surface: surface === "blur" ? "plain" : surface,
  });
  return (
    <View
      aria-hidden
      className={slots.barSurface()}
      style={{
        opacity: rampOpacity(value, SURFACE_ARRIVE),
        pointerEvents: "none",
      }}
    />
  );
};
export const ScrollHeaderBar = forwardRef<
  ComponentRef<typeof View>,
  ScrollHeaderBarProps
>(
  (
    {
      className,
      surface = "plain",
      divider = true,
      intensity: _intensity = 40,
      material: _material = "default",
      children,
      style: _style,
      ...props
    },
    ref
  ) => {
    const { barBand, insetTop } = useScrollHeader("ScrollHeader.Bar");
    return (
      <View
        {...props}
        ref={ref}
        className={scrollHeaderVariants().bar({ className })}
        style={{
          boxSizing: "border-box",
          height: `${barBand * 2}rpx`,
          paddingTop: `${insetTop * 2}rpx`,
          pointerEvents: "auto",
        }}
      >
        <BarSurface surface={surface} divider={divider} />
        <ScrollHeaderSlotContext.Provider value="bar">
          <View
            className="relative flex flex-1 flex-row items-center gap-[24px]"
            style={{ zIndex: 1 }}
          >
            {textChildren(children)}
          </View>
        </ScrollHeaderSlotContext.Provider>
      </View>
    );
  }
);
ScrollHeaderBar.displayName = "ScrollHeader.Bar";
export const ScrollHeaderLarge = forwardRef<
  ComponentRef<typeof View>,
  ScrollHeaderLargeProps
>(({ className, id, onLayout, children, style: _style, ...props }, ref) => {
  const { progress, measureLarge, collapsed } =
    useScrollHeader("ScrollHeader.Large");
  const layoutContent = useMemo(
    () => ({ children, className }),
    [children, className]
  );
  const measured = useElementLayout(true, layoutContent, id, false);
  const latest = useRef(onLayout);
  latest.current = onLayout;
  useEffect(() => {
    if (measured.layout) {
      measureLarge(measured.layout.height);
      latest.current?.({ nativeEvent: { layout: measured.layout } });
    }
  }, [measured.layout, measureLarge]);
  const value = useHeaderNumber(progress);
  return (
    <View
      {...props}
      ref={ref}
      id={measured.id}
      aria-hidden={collapsed}
      className={scrollHeaderVariants().large({ className })}
      style={{
        opacity: 1 - rampOpacity(value, LARGE_EXIT),
        pointerEvents: "none",
      }}
    >
      <ScrollHeaderSlotContext.Provider value="large">
        <View
          className="flex flex-col gap-[8px]"
          style={{ pointerEvents: collapsed ? "none" : "auto" }}
        >
          {textChildren(children)}
        </View>
      </ScrollHeaderSlotContext.Provider>
    </View>
  );
});
ScrollHeaderLarge.displayName = "ScrollHeader.Large";
export const ScrollHeaderTitle = forwardRef<
  ComponentRef<typeof Text>,
  TextProps
>(({ className, ...props }, ref) => {
  const { progress, largeHeight, hasLarge, collapsed } =
    useScrollHeader("ScrollHeader.Title");
  const slot = useContext(ScrollHeaderSlotContext);
  const value = useHeaderNumber(progress);
  const height = useHeaderNumber(largeHeight);
  if (slot === "large") {
    return (
      <Text
        {...props}
        ref={ref}
        size="3xl"
        weight="bold"
        aria-role="heading"
        className={cn("text-[color:var(--panel-foreground)]", className)}
      />
    );
  }
  return (
    <View
      aria-hidden={hasLarge && !collapsed}
      className="flex-1"
      style={{
        opacity: height >= 1 ? rampOpacity(value, BAR_TITLE_ARRIVE) : 1,
      }}
    >
      <Text
        {...props}
        ref={ref}
        size="base"
        weight="semibold"
        numberOfLines={props.numberOfLines ?? 1}
        aria-role="heading"
        className={cn("text-[color:var(--panel-foreground)]", className)}
      />
    </View>
  );
});
ScrollHeaderTitle.displayName = "ScrollHeader.Title";
export const ScrollHeaderDescription = forwardRef<
  ComponentRef<typeof Text>,
  TextProps
>((props, ref) => <Text {...props} ref={ref} size="sm" muted />);
ScrollHeaderDescription.displayName = "ScrollHeader.Description";
export const ScrollHeaderActions = forwardRef<
  ComponentRef<typeof View>,
  ScrollHeaderActionsProps
>(({ className, children, style, ...props }, ref) => (
  <View
    {...props}
    ref={ref}
    className={scrollHeaderVariants().actions({ className })}
    style={mergeStyleAfter(style, { pointerEvents: "auto" })}
  >
    {textChildren(children)}
  </View>
));
ScrollHeaderActions.displayName = "ScrollHeader.Actions";
