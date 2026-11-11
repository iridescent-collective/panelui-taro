import { View } from "@tarojs/components";
import type { CSSProperties } from "react";

import { xOf, yOf } from "../../lib/chart";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { usePlot, usePlotDomain } from "./context";
import type { PlotRuleProps } from "./types";

const ruleStrokeStyle = (
  vertical: boolean,
  dashed: boolean,
  stroke: string,
  width: number
): CSSProperties => {
  if (dashed) {
    return {
      borderBottomWidth: 0,
      borderColor: stroke,
      borderLeftWidth: vertical ? `${width * 2}rpx` : 0,
      borderRightWidth: 0,
      borderStyle: "dashed",
      borderTopWidth: vertical ? 0 : `${width * 2}rpx`,
      height: vertical ? "100%" : 0,
      width: vertical ? 0 : "100%",
    };
  }
  return {
    backgroundColor: stroke,
    height: vertical ? "100%" : `${width * 2}rpx`,
    width: vertical ? `${width * 2}rpx` : "100%",
  };
};
const horizontalRuleVisible = (
  y: number | undefined,
  min: number,
  max: number,
  at: number,
  top: number,
  height: number
) =>
  y !== undefined && min !== max && at >= top - 0.5 && at <= top + height + 0.5;
const RuleLabel = ({
  label,
  color,
  vertical,
  placement,
  className,
}: {
  label: string;
  color?: string;
  vertical: boolean;
  placement: "start" | "end";
  className?: string;
}) => (
  <Text
    size="xs"
    weight="medium"
    numberOfLines={1}
    style={color ? { color } : undefined}
    className={cn(
      vertical ? "absolute top-0 left-[8px]" : "pt-[4px]",
      placement === "end" ? "self-end" : "self-start",
      className
    )}
  >
    {label}
  </Text>
);
export const PlotRule = Object.assign(
  ({
    y,
    x,
    label,
    color,
    strokeWidth = 1,
    dashed = false,
    opacity = 1,
    labelPlacement = "end",
    labelClassName,
    className,
  }: PlotRuleProps) => {
    const { plot, data, status } = usePlot("Plot.Rule");
    const [min, max] = usePlotDomain();
    const muted = useThemeToken("foreground");
    const stroke = color ?? muted;
    const vertical = y === undefined && x !== undefined;
    const at = vertical
      ? xOf(Math.max(0, Math.min(data.length - 1, x ?? 0)), data.length, plot)
      : yOf(y ?? 0, plot, min, max);
    const visible =
      vertical || horizontalRuleVisible(y, min, max, at, plot.top, plot.height);
    if (status === "loading") {
      return null;
    }
    return (
      <View
        className={cn("absolute flex flex-col", className)}
        style={{
          height: vertical ? `${plot.height * 2}rpx` : undefined,
          left: vertical ? `${at * 2}rpx` : `${plot.left * 2}rpx`,
          opacity: visible ? opacity : 0,
          pointerEvents: "none",
          top: vertical ? `${plot.top * 2}rpx` : `${at * 2}rpx`,
          width: vertical ? undefined : `${plot.width * 2}rpx`,
        }}
      >
        <View style={ruleStrokeStyle(vertical, dashed, stroke, strokeWidth)} />
        {label ? (
          <RuleLabel
            label={label}
            color={color}
            vertical={vertical}
            placement={labelPlacement}
            className={labelClassName}
          />
        ) : null}
      </View>
    );
  },
  { displayName: "Plot.Rule", layer: "overlay" }
);
