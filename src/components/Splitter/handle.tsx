import { View } from "@tarojs/components";
import { showActionSheet } from "@tarojs/taro";
import { useContext, useEffect, useRef } from "react";

import { mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { BoundaryIndexContext, useSplitter } from "./context";
import { layoutOffset, resetLayout, resizeLayout } from "./splitter-math";
import type { SplitterHandleProps } from "./types";
import { useSplitterDrag } from "./use-drag";
import { splitterVariants } from "./variants";

export const SplitterHandle = ({
  className,
  disabled,
  withGrip = true,
  accessibilityLabel = "Resize panels",
  style,
  ...props
}: SplitterHandleProps) => {
  const context = useSplitter("Splitter.Handle");
  const boundary = useContext(BoundaryIndexContext);
  const frozen =
    context.disabled ||
    disabled === true ||
    boundary < 0 ||
    boundary + 1 >= context.constraints.length;
  const latest = useRef({ boundary, context, frozen });
  latest.current = { boundary, context, frozen };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const lastTap = useRef<number | null>(null);
  const drag = useSplitterDrag(context, boundary, frozen);
  const slots = splitterVariants({ orientation: context.orientation });
  const horizontal = context.orientation === "horizontal";
  const shift =
    ((context.available * layoutOffset(context.layout, boundary)) / 100 - 12) *
    (horizontal ? context.sign : 1);
  const reset = () => {
    const owner = latest.current;
    if (owner.frozen) {
      return;
    }
    const next = resetLayout(
      owner.context.read(),
      owner.context.initial,
      owner.boundary,
      owner.context.constraints
    );
    owner.context.update(next);
    owner.context.commit(next);
  };
  const adjust = async () => {
    if (latest.current.frozen) {
      return;
    }
    const requested = latest.current;
    try {
      const { tapIndex } = await showActionSheet({
        itemList: [
          "Increase first panel",
          "Decrease first panel",
          "Reset panels",
        ],
      });
      const owner = latest.current;
      if (
        !mounted.current ||
        owner.frozen ||
        owner.boundary !== requested.boundary ||
        owner.context.orientation !== requested.context.orientation ||
        owner.context.initial !== requested.context.initial
      ) {
        return;
      }
      if (tapIndex === 2) {
        reset();
        return;
      }
      if (tapIndex !== 0 && tapIndex !== 1) {
        return;
      }
      const next = resizeLayout(
        owner.context.read(),
        owner.boundary,
        (tapIndex === 0 ? 1 : -1) * owner.context.step,
        owner.context.constraints
      );
      owner.context.update(next);
      owner.context.commit(next);
    } catch {
      return false;
    }
  };
  return (
    <View
      {...props}
      catchMove={!frozen}
      role="separator"
      aria-role="adjustable"
      aria-label={accessibilityLabel}
      aria-description="Double tap to reset. Touch and hold for resize actions."
      aria-disabled={frozen}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(layoutOffset(context.settled, boundary))}
      aria-orientation={context.orientation}
      className={cn("flex", slots.handle({ className }))}
      style={mergeStyleAfter(style, {
        opacity: context.available > 0 ? 1 : 0,
        transform: horizontal
          ? `translateX(${shift * 2}rpx)`
          : `translateY(${shift * 2}rpx)`,
      })}
      onTouchStart={(event) => {
        props.onTouchStart?.(event);
        drag.onTouchStart(event);
      }}
      onTouchMove={async (event) => {
        props.onTouchMove?.(event);
        await drag.onTouchMove(event);
      }}
      onTouchEnd={(event) => {
        props.onTouchEnd?.(event);
        drag.onTouchEnd(event);
      }}
      onTouchCancel={(event) => {
        props.onTouchCancel?.(event);
        drag.onTouchCancel();
      }}
      onClick={(event) => {
        props.onClick?.(event);
        if (frozen || drag.consumeClick()) {
          lastTap.current = null;
          return;
        }
        const now = Date.now();
        if (lastTap.current !== null && now - lastTap.current <= 500) {
          lastTap.current = null;
          reset();
        } else {
          lastTap.current = now;
        }
      }}
      onLongPress={async (event) => {
        props.onLongPress?.(event);
        lastTap.current = null;
        drag.suppressClick();
        await adjust();
      }}
    >
      <View aria-hidden className={slots.line()} />
      {withGrip && <View aria-hidden className={slots.grip()} />}
    </View>
  );
};
