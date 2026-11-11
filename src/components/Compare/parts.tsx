import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useCompare } from "./context";
import type {
  CompareAfterProps,
  CompareBeforeProps,
  CompareLabelProps,
} from "./types";

const After = ({ className, children, style, ...props }: CompareAfterProps) => {
  const { width, height } = useCompare("Compare.After");
  return (
    <View
      {...props}
      className={className}
      style={mergeStyle(
        {
          height: `${height * 2}rpx`,
          left: 0,
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          width: `${width * 2}rpx`,
        },
        style
      )}
    >
      {children}
    </View>
  );
};
const Before = ({
  className,
  children,
  style,
  ...props
}: CompareBeforeProps) => {
  const { ratio, width, height, orientation, mirrored } =
    useCompare("Compare.Before");
  const horizontal = orientation === "horizontal";
  const anchor = horizontal && mirrored ? "right" : "left";
  return (
    <View
      style={{
        [anchor]: 0,
        height: `${(horizontal ? height : ratio * height) * 2}rpx`,
        overflow: "hidden",
        pointerEvents: "none",
        position: "absolute",
        top: 0,
        width: `${(horizontal ? ratio * width : width) * 2}rpx`,
      }}
    >
      <View
        {...props}
        className={className}
        style={mergeStyle(
          {
            [anchor]: 0,
            height: `${height * 2}rpx`,
            position: "absolute",
            top: 0,
            width: `${width * 2}rpx`,
          },
          style
        )}
      >
        {children}
      </View>
    </View>
  );
};
const Label = ({
  className,
  side = "start",
  children,
  style,
  ...props
}: CompareLabelProps) => {
  const { orientation, mirrored } = useCompare("Compare.Label");
  const horizontal = orientation === "horizontal";
  const start = horizontal && mirrored ? side !== "start" : side === "start";
  return (
    <View
      {...props}
      className={cn(
        "rounded-md bg-[var(--panel-background-opacity-80)] px-[16px] py-[8px]",
        className
      )}
      style={mergeStyle(
        {
          pointerEvents: "none",
          position: "absolute",
          ...(horizontal
            ? { top: "16rpx", [start ? "left" : "right"]: "16rpx" }
            : { left: "16rpx", [start ? "top" : "bottom"]: "16rpx" }),
        },
        style
      )}
    >
      {typeof children === "string" ? (
        <Text size="xs" weight="medium" numberOfLines={1}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};
export const CompareAfter = Object.assign(After, {
  displayName: "Compare.After",
  layer: "base" as const,
});
export const CompareBefore = Object.assign(Before, {
  displayName: "Compare.Before",
  layer: "clip" as const,
});
export const CompareLabel = Object.assign(Label, {
  displayName: "Compare.Label",
  layer: "over" as const,
});
