import { View } from "@tarojs/components";
import { useSyncExternalStore } from "react";

import { useDirectionSign } from "../../hooks/use-direction";
import { CheckIcon, ChevronRightIcon, IconColorProvider } from "../../icons";
import { mergeStyle, mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { RAIL_INSET, THUMB_SIZE } from "./constants";
import { useSlideButtonContext } from "./context";
import type { SlideButtonLabelProps, SlideButtonThumbProps } from "./types";

export const SlideButtonFill = () => {
  const { progress, travel, size, slots } =
    useSlideButtonContext("SlideButton.Fill");
  const value = useSyncExternalStore(
    progress.subscribe,
    progress.getSnapshot,
    progress.getSnapshot
  );
  const sign = useDirectionSign();
  const anchor =
    sign === 1
      ? { left: `${RAIL_INSET * 2}rpx` }
      : { right: `${RAIL_INSET * 2}rpx` };
  return (
    <View
      aria-hidden
      className={slots.fill()}
      style={{
        ...anchor,
        bottom: `${RAIL_INSET * 2}rpx`,
        pointerEvents: "none",
        top: `${RAIL_INSET * 2}rpx`,
        width: `${value * (travel + THUMB_SIZE[size].width / 2) * 2}rpx`,
      }}
    />
  );
};
export const SlideButtonLabel = ({
  className,
  style,
  children,
  ...props
}: SlideButtonLabelProps) => {
  const { slots } = useSlideButtonContext("SlideButton.Label");
  return (
    <View
      {...props}
      className="flex flex-1 items-center justify-center"
      style={mergeStyleAfter(style, { pointerEvents: "none" })}
    >
      <Text className={slots.label({ className })}>{children}</Text>
    </View>
  );
};
export const SlideButtonThumb = ({
  className,
  style,
  children,
  ...props
}: SlideButtonThumbProps) => {
  const { progress, travel, done, completed, slots, size } =
    useSlideButtonContext("SlideButton.Thumb");
  const value = useSyncExternalStore(
    progress.subscribe,
    progress.getSnapshot,
    progress.getSnapshot
  );
  const doneValue = useSyncExternalStore(
    done.subscribe,
    done.getSnapshot,
    done.getSnapshot
  );
  const sign = useDirectionSign();
  const tint = useThemeToken("muted-foreground");
  const box = THUMB_SIZE[size];
  const anchor =
    sign === 1
      ? { left: `${RAIL_INSET * 2}rpx` }
      : { right: `${RAIL_INSET * 2}rpx` };
  return (
    <View
      {...props}
      className={cn("flex", slots.thumb({ className }))}
      style={mergeStyleAfter(
        mergeStyle(
          {
            ...anchor,
            height: `${box.height * 2}rpx`,
            top: "50%",
            transform: `translateY(-50%) translateX(${value * travel * sign * 2}rpx)`,
            width: `${box.width * 2}rpx`,
          },
          style
        ),
        { pointerEvents: "none" }
      )}
    >
      <IconColorProvider color={tint}>
        <View
          className={cn("flex", slots.thumbContent())}
          style={{ opacity: 1 - doneValue }}
        >
          {children ?? <ChevronRightIcon size={20} />}
        </View>
        <View
          aria-hidden={!completed}
          className={cn("flex", slots.thumbContent())}
          style={{
            inset: 0,
            opacity: doneValue,
            position: "absolute",
            transform: `scale(${0.7 + doneValue * 0.3})`,
          }}
        >
          <CheckIcon size={20} />
        </View>
      </IconColorProvider>
    </View>
  );
};
SlideButtonLabel.displayName = "SlideButton.Label";
SlideButtonThumb.displayName = "SlideButton.Thumb";
