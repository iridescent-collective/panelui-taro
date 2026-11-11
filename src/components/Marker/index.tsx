import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { AnimatedPressable } from "../../primitives/animated-pressable";
import { textChildren } from "../primitives/Text";
import { Separator } from "../Separator";
import { MarkerContext } from "./context";
import { MarkerIcon, MarkerContent } from "./parts";
import type { MarkerProps } from "./types";
import { markerVariants } from "./variants";

export type {
  MarkerProps,
  MarkerIconProps,
  MarkerContentProps,
  MarkerVariant,
} from "./types";

const MarkerRoot = forwardRef<ComponentRef<typeof View>, MarkerProps>(
  (
    {
      className,
      variant = "default",
      disabled,
      children,
      onPress,
      onClick,
      ...props
    },
    ref
  ) => {
    const { root } = markerVariants({ disabled: !!disabled, variant });
    const inner =
      variant === "separator" ? (
        <>
          <Separator className="flex-1" />
          {textChildren(children)}
          <Separator className="flex-1" />
        </>
      ) : (
        children
      );
    const body =
      onClick || onPress ? (
        <AnimatedPressable
          {...props}
          ref={ref}
          accessibilityRole="button"
          accessibilityState={{
            ...props.accessibilityState,
            disabled: !!disabled,
          }}
          disabled={disabled}
          onClick={onClick ?? onPress}
          className={root({ className })}
        >
          {inner}
        </AnimatedPressable>
      ) : (
        <View
          {...props}
          id={props.id}
          style={props.style}
          aria-label={props.accessibilityLabel ?? props["aria-label"]}
          aria-disabled={!!disabled}
          ref={ref}
          className={root({ className })}
        >
          {inner}
        </View>
      );
    return (
      <MarkerContext.Provider value={variant}>{body}</MarkerContext.Provider>
    );
  }
);
export const Marker = Object.assign(MarkerRoot, {
  Content: MarkerContent,
  Icon: MarkerIcon,
});
