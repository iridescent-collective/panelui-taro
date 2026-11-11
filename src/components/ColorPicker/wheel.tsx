import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { hsvToCss } from "../../lib/color";
import { selectionTick } from "../../lib/haptics";
import { AREA_THUMB, WHEEL_SIZE } from "./constants";
import { useColorFrame } from "./context";
import { WheelDrawing } from "./drawing";
import { wheelColor } from "./math";
import { ColorThumb } from "./thumb";
import type { ColorPickerWheelProps } from "./types";
import { WHEEL_NUDGES, useColorNudge } from "./use-nudge";
import { useColorTouch } from "./use-touch";
import { colorPickerVariants } from "./variants";

export const ColorPickerWheel = forwardRef<
  ComponentRef<typeof View>,
  ColorPickerWheelProps
>(({ className, size, thumbClassName }, ref) => {
  const nudge = useColorNudge(WHEEL_NUDGES);
  const { ctx, color } = useColorFrame();
  const { scale } = useWindowMetrics();
  const diameter = size ?? WHEEL_SIZE[ctx.size];
  const radius = diameter / 2;
  const thumb = AREA_THUMB[ctx.size];
  const measured = useElementLayout(true, diameter, undefined, false);
  const slots = colorPickerVariants({ size: ctx.size });
  const touch = useColorTouch(
    !ctx.disabled,
    false,
    scale,
    (x, y, commit, frame) => {
      ctx.emit(
        {
          ...ctx.signal.value,
          ...wheelColor(
            (x * diameter) / frame.width,
            (y * diameter) / frame.height,
            radius
          ),
        },
        commit
      );
      if (commit && ctx.haptics) {
        void selectionTick();
      }
    },
    measured.refresh
  );
  const angle = (color.h * Math.PI) / 180;
  const r = color.s * radius;
  return (
    <View
      id={measured.id}
      ref={ref}
      className="relative self-center"
      style={{ height: `${diameter * 2}rpx`, width: `${diameter * 2}rpx` }}
      aria-label="Hue and saturation"
      aria-disabled={ctx.disabled}
      catchMove={!ctx.disabled}
      onLongPress={() => {
        touch.onTouchCancel();
        void nudge();
      }}
      onTouchStart={touch.onTouchStart}
      onTouchMove={touch.onTouchMove}
      onTouchEnd={touch.onTouchEnd}
      onTouchCancel={touch.onTouchCancel}
    >
      <View
        className={slots.wheel({ className: `relative ${className ?? ""}` })}
        style={{ height: `${diameter * 2}rpx`, width: `${diameter * 2}rpx` }}
      >
        <WheelDrawing diameter={diameter} />
        <View
          aria-hidden
          className="absolute inset-0 bg-black"
          style={{ opacity: 1 - color.v, pointerEvents: "none" }}
        />
      </View>
      <ColorThumb
        diameter={thumb}
        x={radius + r * Math.cos(angle) - thumb / 2}
        y={radius + r * Math.sin(angle) - thumb / 2}
        color={hsvToCss(color.h, color.s, color.v, 1)}
        className={thumbClassName}
      />
    </View>
  );
});
ColorPickerWheel.displayName = "ColorPicker.Wheel";
