import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import type { ShimmerProps } from "./types";
import { useShimmer } from "./use-shimmer";

export type { ShimmerProps } from "./types";
export const Shimmer = (props: ShimmerProps) => {
  const {
    className,
    as,
    duration: _duration,
    spread: _spread,
    baseColor: _baseColor,
    shimmerColor: _shimmerColor,
    mode: _mode,
    once: _once,
    reverse: _reverse,
    enabled: _enabled,
    textClassName,
    textStyle,
    color: _color,
    intensity: _intensity,
    children,
    maskSource,
    ...native
  } = props;
  const { animating, base, id, sweep } = useShimmer(props);
  const plain = mergeStyle({ color: base }, textStyle);
  const textSweep =
    typeof textStyle === "string"
      ? `color:transparent;background-clip:text;-webkit-background-clip:text;${Object.entries(
          sweep
        )
          .map(
            ([key, value]) =>
              `${key.replaceAll(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)}:${value}`
          )
          .join(";")};${textStyle};color:transparent;`
      : {
          ...textStyle,
          ...sweep,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        };
  const mask = maskSource ? `url(${JSON.stringify(maskSource)})` : undefined;
  return (
    <View
      {...native}
      id={id}
      className={cn("relative", animating && "overflow-hidden", className)}
    >
      {as === "view" ? (
        children
      ) : (
        <Text className={textClassName} style={animating ? textSweep : plain}>
          {children}
        </Text>
      )}
      {as === "view" && animating ? (
        <View
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            ...sweep,
            WebkitMaskImage: mask,
            WebkitMaskSize: "100% 100%",
            maskImage: mask,
            maskSize: "100% 100%",
            opacity: maskSource ? 1 : 0.35,
          }}
        />
      ) : null}
    </View>
  );
};
