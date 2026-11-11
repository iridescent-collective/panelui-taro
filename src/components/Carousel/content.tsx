import { View } from "@tarojs/components";
import { Children, isValidElement, useEffect } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { CarouselItemIndexContext, useCarousel } from "./context";
import type { CarouselContentProps } from "./types";

export const CarouselContent = ({
  className,
  children,
  style,
  ...props
}: CarouselContentProps) => {
  const { setCount, variant, orientation, align } =
    useCarousel("Carousel.Content");
  const slides = Children.toArray(children);
  const horizontal = orientation === "horizontal";
  const centred =
    align === "center" || variant === "coverflow" || variant === "stack";
  useEffect(() => {
    setCount(slides.length);
  }, [setCount, slides.length]);
  return (
    <View
      {...props}
      className={cn(
        "relative flex w-full flex-col overflow-hidden",
        horizontal
          ? cn("justify-center", centred ? "items-center" : "items-start")
          : cn("items-center", centred ? "justify-center" : "justify-start"),
        className
      )}
      style={mergeStyle(
        variant === "coverflow" ? { perspective: "2000rpx" } : {},
        style
      )}
    >
      {slides.map((child, index) => (
        <CarouselItemIndexContext.Provider
          key={isValidElement(child) && child.key !== null ? child.key : index}
          value={index}
        >
          {child}
        </CarouselItemIndexContext.Provider>
      ))}
    </View>
  );
};
CarouselContent.displayName = "Carousel.Content";
