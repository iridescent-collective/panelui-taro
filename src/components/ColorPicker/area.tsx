import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { useDirectionSign } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { hsvToCss } from "../../lib/color";
import { selectionTick } from "../../lib/haptics";
import { AREA_HEIGHT, AREA_THUMB } from "./constants";
import { useColorFrame } from "./context";
import { areaColor } from "./math";
import { ColorThumb } from "./thumb";
import type { ColorPickerAreaProps } from "./types";
import { AREA_NUDGES, useColorNudge } from "./use-nudge";
import { useColorTouch } from "./use-touch";
import { colorPickerVariants } from "./variants";

export const ColorPickerArea = forwardRef<
  ComponentRef<typeof View>,
  ColorPickerAreaProps
>(({ className, height, thumbClassName }, ref) => {
  const nudge = useColorNudge(AREA_NUDGES);
  const { ctx, color } = useColorFrame();
  const sign = useDirectionSign();
  const { scale } = useWindowMetrics();
  const boxHeight = height ?? AREA_HEIGHT[ctx.size];
  const thumbSize = AREA_THUMB[ctx.size];
  const measured = useElementLayout(true, boxHeight, undefined, false);
  const width = measured.layout?.width ?? 0;
  const slots = colorPickerVariants({ size: ctx.size });
  const touch = useColorTouch(
    !ctx.disabled,
    false,
    scale,
    (x, y, commit, frame) => {
      ctx.emit(
        {
          ...ctx.signal.value,
          ...areaColor(x, y, frame.width, frame.height, sign),
        },
        commit
      );
      if (commit && ctx.haptics) {
        void selectionTick();
      }
    },
    measured.refresh
  );
  const x =
    sign === 1
      ? color.s * width - thumbSize / 2
      : width - color.s * width - thumbSize / 2;
  return (
    <View
      id={measured.id}
      ref={ref}
      className="relative w-full"
      style={{ height: `${boxHeight * 2}rpx` }}
      aria-label="Saturation and brightness"
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
        className={slots.area({
          className: `absolute inset-0 ${className ?? ""}`,
        })}
      >
        <View
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundColor: hsvToCss(color.h, 1, 1, 1),
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1)),linear-gradient(to ${sign === 1 ? "right" : "left"}, rgba(255,255,255,1), rgba(255,255,255,0))`,
            backgroundRepeat: "no-repeat",
            pointerEvents: "none",
          }}
        />
      </View>
      <ColorThumb
        diameter={thumbSize}
        x={x}
        y={(1 - color.v) * boxHeight - thumbSize / 2}
        color={hsvToCss(color.h, color.s, color.v, 1)}
        className={thumbClassName}
      />
    </View>
  );
});
ColorPickerArea.displayName = "ColorPicker.Area";
