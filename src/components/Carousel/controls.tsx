import { View } from "@tarojs/components";

import { ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useCarousel } from "./context";
import type {
  CarouselArrowProps,
  CarouselControlsProps,
  CarouselDotsProps,
} from "./types";

export const CarouselDots = ({
  className,
  orientation = "horizontal",
  interactive = true,
  ...props
}: CarouselDotsProps) => {
  const { count, index, scrollTo } = useCarousel("Carousel.Dots");
  const horizontal = orientation === "horizontal";
  if (count <= 1) {
    return null;
  }
  return (
    <View
      aria-role="tablist"
      role="tablist"
      {...props}
      className={cn(
        "flex items-center gap-[8px]",
        horizontal ? "flex-row" : "flex-col",
        className
      )}
    >
      {Array.from({ length: count }, (_, dot) => {
        const active = dot === index;
        const activeSize = horizontal ? "h-[8px] w-[32px]" : "h-[32px] w-[8px]";
        return (
          <AnimatedPressable
            pressScale={1}
            key={dot}
            disabled={!interactive}
            onPress={() => scrollTo(dot)}
            accessibilityRole="tab"
            accessibilityLabel={`Slide ${dot + 1} of ${count}`}
            accessibilityState={{ selected: active }}
            className={cn(
              "flex items-center justify-center",
              interactive && "h-[48px] w-[48px]"
            )}
          >
            <View
              className={cn(
                "rounded-full",
                active ? activeSize : "h-[8px] w-[8px]",
                active
                  ? "bg-[var(--panel-foreground)]"
                  : "bg-[var(--panel-foreground)] opacity-30"
              )}
            />
          </AnimatedPressable>
        );
      })}
    </View>
  );
};
CarouselDots.displayName = "Carousel.Dots";
const CarouselArrow = ({
  direction,
  className,
  children,
  onClick,
  ...props
}: CarouselArrowProps & { direction: "previous" | "next" }) => {
  const { count, index, loop, next, previous } = useCarousel(
    `Carousel.${direction}`
  );
  const disabled =
    !loop && (direction === "next" ? index >= count - 1 : index <= 0);
  return (
    <AnimatedPressable
      pressScale={1}
      {...props}
      disabled={disabled}
      onPress={(event) => {
        onClick?.(event);
        return direction === "next" ? next() : previous();
      }}
      accessibilityRole="button"
      accessibilityLabel={
        direction === "next" ? "Next slide" : "Previous slide"
      }
      accessibilityState={{ disabled }}
      className={cn(
        "flex h-[96px] w-[96px] items-center justify-center rounded-full",
        disabled ? "opacity-30" : "active:bg-[var(--panel-foreground)]/10",
        className
      )}
    >
      {children ??
        (direction === "next" ? (
          <ChevronRightIcon size={14} />
        ) : (
          <ChevronLeftIcon size={14} />
        ))}
    </AnimatedPressable>
  );
};
export const CarouselPrevious = (props: CarouselArrowProps) => (
  <CarouselArrow {...props} direction="previous" />
);
CarouselPrevious.displayName = "Carousel.Previous";
export const CarouselNext = (props: CarouselArrowProps) => (
  <CarouselArrow {...props} direction="next" />
);
CarouselNext.displayName = "Carousel.Next";
export const CarouselControls = ({
  className,
  ...props
}: CarouselControlsProps) => (
  <View
    {...props}
    className={cn(
      "flex flex-row items-center justify-center gap-[16px] self-center rounded-full border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)]/80 px-[12px] py-[4px]",
      className
    )}
  >
    <CarouselPrevious />
    <CarouselDots />
    <CarouselNext />
  </View>
);
CarouselControls.displayName = "Carousel.Controls";
