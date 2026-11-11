import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { cn } from "../../lib/utils";
import { FlipCardContext } from "./context";
import { FlipCardFront, FlipCardBack } from "./faces";
import { resolveFaces } from "./resolve-faces";
import type { FlipCardProps } from "./types";
import { useFlipController } from "./use-flip-controller";
import { flipCardVariants } from "./variants";

export { useFlipCard } from "./context";
export type {
  FlipCardProps,
  FlipCardFaceProps,
  FlipCardDirection,
  FlipCardRotation,
  FlipCardTrigger,
} from "./types";

const FlipCardRoot = forwardRef<ComponentRef<typeof View>, FlipCardProps>(
  (
    {
      children,
      direction = "horizontal",
      rotation = "normal",
      flipped: flippedProp,
      defaultFlipped = false,
      onFlippedChange,
      trigger = "press",
      perspective = 1000,
      className,
      id,
      style,
      onClick,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
      ...props
    },
    ref
  ) => {
    const { context, drag, flip, flipped, layout, motion } = useFlipController({
      children,
      className,
      defaultFlipped,
      direction,
      flipped: flippedProp,
      id,
      onFlippedChange,
      perspective,
      rotation,
      style,
      trigger,
    });
    const sign = rotation === "reverse" ? -1 : 1;
    const axis = direction === "horizontal" ? "rotateY" : "rotateX";
    const frontShowing = motion.value < 0.5;
    const slots = flipCardVariants();
    const { front, back } = resolveFaces(children);
    return (
      <FlipCardContext.Provider value={context}>
        <View
          {...props}
          ref={ref}
          id={layout.id}
          style={style}
          className={cn(slots.root(), "flex flex-col", className)}
          role={trigger === "none" ? undefined : "button"}
          aria-role={trigger === "none" ? undefined : "button"}
          aria-expanded={flipped}
          aria-label={props.ariaLabel ?? "Flip the card over"}
          catchMove={trigger === "drag"}
          onClick={(event) => {
            onClick?.(event);
            if (trigger === "press" && !drag.shouldSuppressClick()) {
              flip();
            }
          }}
          onTouchStart={(event) => {
            drag.onTouchStart(event);
            onTouchStart?.(event);
          }}
          onTouchMove={(event) => {
            drag.onTouchMove(event);
            onTouchMove?.(event);
          }}
          onTouchEnd={(event) => {
            drag.onTouchEnd(event);
            onTouchEnd?.(event);
          }}
          onTouchCancel={(event) => {
            drag.onTouchCancel();
            onTouchCancel?.(event);
          }}
        >
          <View
            aria-hidden={flipped}
            className={cn(slots.face(), "grow")}
            style={{
              height: "100%",
              opacity: frontShowing ? 1 : 0,
              pointerEvents: frontShowing ? "auto" : "none",
              transform: `perspective(${perspective * 2}rpx) ${axis}(${motion.value * 180 * sign}deg)`,
              zIndex: frontShowing ? 1 : 0,
            }}
          >
            {front}
          </View>
          <View
            aria-hidden={!flipped}
            className={cn(slots.face(), "absolute inset-0")}
            style={{
              opacity: frontShowing ? 0 : 1,
              pointerEvents: frontShowing ? "none" : "auto",
              transform: `perspective(${perspective * 2}rpx) ${axis}(${(motion.value - 1) * 180 * sign}deg)`,
              zIndex: frontShowing ? 0 : 1,
            }}
          >
            {back}
          </View>
        </View>
      </FlipCardContext.Provider>
    );
  }
);
export const FlipCard = Object.assign(FlipCardRoot, {
  Back: FlipCardBack,
  Front: FlipCardFront,
});
