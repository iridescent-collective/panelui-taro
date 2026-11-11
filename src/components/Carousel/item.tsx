import { View } from "@tarojs/components";
import type { CSSProperties } from "react";
import { useContext, useSyncExternalStore } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text, textChildren } from "../primitives/Text";
import { CarouselItemIndexContext, useCarousel } from "./context";
import {
  carouselCaptionOpacity,
  carouselDistance,
  carouselMotion,
} from "./math";
import type { CarouselCaptionProps, CarouselItemProps } from "./types";

export const CarouselItem = ({
  className,
  children,
  style,
  ...props
}: CarouselItemProps) => {
  const context = useCarousel("Carousel.Item");
  const index = useContext(CarouselItemIndexContext);
  const progress = useSyncExternalStore(
    context.progress.subscribe,
    context.progress.getSnapshot,
    context.progress.getSnapshot
  );
  const engaged = useSyncExternalStore(
    context.engaged.subscribe,
    context.engaged.getSnapshot,
    context.engaged.getSnapshot
  );
  const horizontal = context.orientation === "horizontal";
  const stacked =
    context.variant === "coverflow" || context.variant === "stack";
  const centred = context.align === "center" || stacked;
  const sized =
    context.variant === "default" || context.variant === "interactive";
  const dimensions: CSSProperties = {};
  if (sized) {
    if (horizontal) {
      dimensions.width = `${context.itemSize * 2}rpx`;
      if (context.variant === "default") {
        dimensions.height = "100%";
      }
    } else {
      dimensions.height = `${context.itemSize * 2}rpx`;
      if (context.variant === "default") {
        dimensions.width = "100%";
      }
    }
  }
  const motion = carouselMotion(
    context.variant,
    context.orientation,
    carouselDistance(index, progress, context.count, context.loop),
    context.itemSize,
    engaged
  );
  const origin = horizontal
    ? `translate(${centred ? "-50%" : "0"},-50%)`
    : `translate(-50%,${centred ? "-50%" : "0"})`;
  return (
    <View
      {...props}
      aria-hidden={stacked && index !== context.index}
      className={cn(className)}
      style={mergeStyle(
        {
          ...dimensions,
          left: horizontal && !centred ? "0" : "50%",
          pointerEvents: stacked && index !== context.index ? "none" : "auto",
          position: "absolute",
          top: !horizontal && !centred ? "0" : "50%",
          ...motion,
          transform: `${origin} ${motion.transform}`,
        },
        style
      )}
    >
      {textChildren(children)}
    </View>
  );
};
CarouselItem.displayName = "Carousel.Item";
export const CarouselCaption = ({
  className,
  children,
  style,
  ...props
}: CarouselCaptionProps) => {
  const { progress, count, loop } = useCarousel("Carousel.Caption");
  const index = useContext(CarouselItemIndexContext);
  const value = useSyncExternalStore(
    progress.subscribe,
    progress.getSnapshot,
    progress.getSnapshot
  );
  return (
    <View
      {...props}
      style={mergeStyle(
        {
          opacity: carouselCaptionOpacity(
            carouselDistance(index, value, count, loop)
          ),
        },
        style
      )}
      className={cn(className)}
    >
      {textChildren(children, (text) => (
        <Text size="xs" weight="semibold" className="text-center">
          {text}
        </Text>
      ))}
    </View>
  );
};
CarouselCaption.displayName = "Carousel.Caption";
