import { View } from "@tarojs/components";
import { showActionSheet } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import { mergeStyle, mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useCompare } from "./context";
import type { CompareHandleProps } from "./types";
import { compareVariants } from "./variants";

const Handle = ({
  className: _className,
  withGrip = true,
  accessibilityLabel = "Compare",
  children,
  style,
  ...props
}: CompareHandleProps) => {
  const context = useCompare("Compare.Handle");
  const { ratio, width, height, orientation, mirrored, disabled } = context;
  const horizontal = orientation === "horizontal";
  const anchor = horizontal && mirrored ? "right" : "left";
  const offset = ratio * (horizontal ? width : height) - 18;
  const variants = compareVariants({ orientation });
  const latest = useRef(context);
  latest.current = context;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const adjust = async () => {
    const requested = latest.current;
    if (requested.disabled) {
      return;
    }
    try {
      const { tapIndex } = await showActionSheet({
        itemList: ["Increase comparison", "Decrease comparison"],
      });
      const owner = latest.current;
      if (
        !mounted.current ||
        owner.disabled ||
        owner.orientation !== requested.orientation ||
        owner.mirrored !== requested.mirrored ||
        (tapIndex !== 0 && tapIndex !== 1)
      ) {
        return;
      }
      owner.nudge((tapIndex === 0 ? 1 : -1) * owner.step);
    } catch {
      return false;
    }
  };
  return (
    <View
      {...props}
      role="slider"
      aria-role="adjustable"
      aria-label={accessibilityLabel}
      aria-disabled={disabled}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
      aria-description="Touch and hold for comparison actions."
      className={cn("flex", variants.seam())}
      style={mergeStyleAfter(
        mergeStyle(
          horizontal
            ? { width: "72rpx", [anchor]: 0 }
            : { height: "72rpx", top: 0 },
          style
        ),
        {
          transform: horizontal
            ? `translateX(${offset * (mirrored ? -1 : 1) * 2}rpx)`
            : `translateY(${offset * 2}rpx)`,
        }
      )}
      onLongPress={async (event) => {
        props.onLongPress?.(event);
        await adjust();
      }}
    >
      <View className={variants.line()} style={{ pointerEvents: "none" }} />
      {children ?? (
        <View
          className={cn("flex", variants.knob())}
          style={{ height: "72rpx", pointerEvents: "none", width: "72rpx" }}
        >
          {withGrip ? (
            <View
              className={
                horizontal
                  ? "flex flex-row gap-[8px]"
                  : "flex flex-col gap-[8px]"
              }
            >
              <View className={variants.grip()} />
              <View className={variants.grip()} />
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};
export const CompareHandle = Object.assign(Handle, {
  displayName: "Compare.Handle",
  layer: "over" as const,
});
