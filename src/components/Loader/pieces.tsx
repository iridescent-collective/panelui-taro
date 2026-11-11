import { View } from "@tarojs/components";
import type { CSSProperties } from "react";

import { GEOMETRY, WAVE_OFFSETS } from "./constants";
import { repeatValue } from "./geometry";
import type { LoaderVariant } from "./types";

const px = (value: number) => `${value * 2}rpx`;
const dots = (
  variant: "pulse-dots" | "bounce-dots" | "pulsating-dots",
  index: number,
  scale: number,
  time: number,
  animate: boolean
): CSSProperties => {
  if (variant === "pulse-dots") {
    const still = index === 1 ? 1 : 0.45;
    return {
      opacity: animate ? repeatValue(time, index * 200, 700, 0.2, 1) : still,
    };
  }
  if (variant === "bounce-dots") {
    const travel = 8 * scale;
    const y = animate
      ? repeatValue(time, index * 100, 300, 0, -travel)
      : -travel * (index === 1 ? 1 : 0.35);
    return { transform: `translateY(${px(y)})` };
  }
  const still = index === 1 ? 1.4 : 1.1;
  const value = animate ? repeatValue(time, index * 200, 600, 1, 1.5) : still;
  return { opacity: 0.5 + (value - 1), transform: `scale(${value})` };
};
export const LoaderPieces = ({
  variant,
  scale,
  ink,
  time,
  animate,
}: {
  variant: Exclude<
    LoaderVariant,
    "liquid-dots" | "wave-physics" | "morph-ring"
  >;
  scale: number;
  ink: string;
  time: number;
  animate: boolean;
}) => {
  if (
    variant === "pulse-dots" ||
    variant === "bounce-dots" ||
    variant === "pulsating-dots"
  ) {
    const g = GEOMETRY[variant];
    const padding = variant === "pulsating-dots" ? g.dot * scale * 0.3 : 0;
    return (
      <View
        className="flex flex-row items-center"
        style={{
          gap: px(g.gap * scale),
          padding: px(padding),
          paddingTop: variant === "bounce-dots" ? px(8 * scale) : px(padding),
        }}
      >
        {Array.from({ length: g.count }, (_, index) => (
          <View
            key={`dot-${index}`}
            style={{
              backgroundColor: ink,
              borderRadius: "50%",
              height: px(g.dot * scale),
              width: px(g.dot * scale),
              ...dots(variant, index, scale, time, animate),
            }}
          />
        ))}
      </View>
    );
  }
  const g = GEOMETRY[variant];
  const max =
    variant === "bouncing-bars"
      ? GEOMETRY["bouncing-bars"].height
      : GEOMETRY[variant].max;
  return (
    <View
      className="flex flex-row items-center"
      style={{ gap: px(g.gap * scale), height: px(max * scale) }}
    >
      {Array.from({ length: g.count }, (_, index) => {
        let style: CSSProperties;
        if (variant === "bouncing-bars") {
          const value = animate
            ? repeatValue(time, index * 200, 500, 0.3, 1)
            : 0.4 + index * 0.25;
          style = { height: px(max * scale), transform: `scaleY(${value})` };
        } else {
          const geometry = GEOMETRY[variant];
          const offset = WAVE_OFFSETS[index] ?? 0;
          const still =
            variant === "bar-cascade"
              ? (geometry.min +
                  (geometry.max - geometry.min) *
                    Math.abs(Math.sin(index * 0.9))) *
                scale
              : (geometry.min +
                  (geometry.max - geometry.min) * (1 - offset / 4)) *
                scale;
          const height = animate
            ? repeatValue(
                time,
                (variant === "bar-cascade" ? index : offset) * 100,
                variant === "bar-cascade" ? 500 : 600,
                geometry.min * scale,
                geometry.max * scale
              )
            : still;
          style = { height: px(height) };
        }
        return (
          <View
            key={`bar-${index}`}
            style={{
              backgroundColor: ink,
              borderRadius: px((g.bar * scale) / 2),
              width: px(g.bar * scale),
              ...style,
            }}
          />
        );
      })}
    </View>
  );
};
