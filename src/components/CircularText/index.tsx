import { View } from "@tarojs/components";
import { useMemo } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import {
  DEFAULT_CIRCULAR_TEXT_DURATION,
  DEFAULT_CIRCULAR_TEXT_RADIUS,
  DEFAULT_CIRCULAR_TEXT_SPREAD,
  circularTextGlyphs,
  normalizeDuration,
  normalizeRadius,
  normalizeSpread,
} from "./geometry";
import { glyphVariants } from "./glyph-variants";
import type { CircularTextProps } from "./types";
import { useRotation } from "./use-rotation";
import { circularTextVariants } from "./variants";

export type { CircularTextProps } from "./types";
export const CircularText = ({
  children,
  radius = DEFAULT_CIRCULAR_TEXT_RADIUS,
  spinDuration = DEFAULT_CIRCULAR_TEXT_DURATION,
  reverse = false,
  paused = false,
  spread = DEFAULT_CIRCULAR_TEXT_SPREAD,
  startAngle = 0,
  className,
  textClassName,
  style,
  ...props
}: CircularTextProps) => {
  const reduced = usePanelReducedMotion();
  const size = normalizeRadius(radius) * 2;
  const duration = normalizeDuration(spinDuration);
  const arc = normalizeSpread(spread);
  const glyphs = useMemo(
    () => circularTextGlyphs(children, arc, startAngle),
    [children, arc, startAngle]
  );
  const turning = !paused && !reduced && duration > 0 && glyphs.length > 0;
  const rotation = useRotation(turning, duration, reverse);
  const dimensions = { height: `${size * 2}rpx`, width: `${size * 2}rpx` };
  return (
    <View
      {...props}
      aria-role="text"
      aria-label={children}
      className={cn(circularTextVariants(), "flex", className)}
      style={mergeStyle(dimensions, style)}
    >
      <View
        aria-hidden
        className="panelui-circular-rotor relative"
        style={{ ...dimensions, transform: `rotate(${rotation}deg)` }}
      >
        {glyphs.map((glyph) => (
          <View
            key={`${glyph.character}-${glyph.index}`}
            className={cn(glyphVariants(), "flex flex-col")}
            style={{
              ...dimensions,
              left: 0,
              position: "absolute",
              top: 0,
              transform: `rotate(${glyph.angle}deg)`,
            }}
          >
            <Text
              className={cn("text-[36px] leading-[1.555556]", textClassName)}
            >
              {glyph.character}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
