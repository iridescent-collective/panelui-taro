import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef, Ref } from "react";

import { useDirectionSign } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { hsvToCss } from "../../lib/color";
import { selectionTick } from "../../lib/haptics";
import {
  CHANNEL_LABEL,
  HUE_STOPS,
  TRACK_HEIGHT,
  TRACK_THUMB,
} from "./constants";
import { useColorFrame } from "./context";
import { Checkerboard } from "./drawing";
import { trackFraction } from "./math";
import { ColorThumb } from "./thumb";
import type { ColorPickerHueProps } from "./types";
import { useColorNudge } from "./use-nudge";
import { useColorTouch } from "./use-touch";
import { colorPickerVariants } from "./variants";

const ChannelTrack = ({
  channel,
  innerRef,
  className,
  thumbClassName,
}: ColorPickerHueProps & {
  channel: "hue" | "brightness" | "alpha";
  innerRef: Ref<ComponentRef<typeof View>>;
}) => {
  const { ctx, color } = useColorFrame();
  const sign = useDirectionSign();
  const { scale } = useWindowMetrics();
  const thumb = TRACK_THUMB[ctx.size];
  const trackHeight = TRACK_HEIGHT[ctx.size];
  const measured = useElementLayout(true, ctx.size, undefined, false);
  const width = measured.layout?.width ?? 0;
  const key = ({ alpha: "a", brightness: "v", hue: "h" } as const)[channel];
  const nudge = useColorNudge([
    { delta: channel === "hue" ? 10 : 0.05, key, label: "Increase" },
    { delta: channel === "hue" ? -10 : -0.05, key, label: "Decrease" },
  ]);
  const fraction = channel === "hue" ? color.h / 360 : color[key];
  const touch = useColorTouch(
    !ctx.disabled,
    true,
    scale,
    (x, _y, commit, frame) => {
      const pickedFraction = trackFraction(x, frame.width, thumb, sign);
      ctx.emit(
        {
          ...ctx.signal.value,
          [key]: channel === "hue" ? pickedFraction * 360 : pickedFraction,
        },
        commit
      );
      if (commit && ctx.haptics) {
        void selectionTick();
      }
    },
    measured.refresh
  );
  const slots = colorPickerVariants({ size: ctx.size });
  const solid = hsvToCss(color.h, color.s, color.v, 1);
  let gradient = `linear-gradient(to ${sign === 1 ? "right" : "left"}, #000000, ${hsvToCss(color.h, color.s, 1, 1)})`;
  if (channel === "hue") {
    gradient = `linear-gradient(to ${sign === 1 ? "right" : "left"}, ${HUE_STOPS.join(",")})`;
  }
  if (channel === "alpha") {
    gradient = `linear-gradient(to ${sign === 1 ? "right" : "left"}, ${hsvToCss(color.h, color.s, color.v, 0)}, ${solid})`;
  }
  let thumbColor = solid;
  if (channel === "hue") {
    thumbColor = hsvToCss(color.h, 1, 1, 1);
  }
  if (channel === "alpha") {
    thumbColor = hsvToCss(color.h, color.s, color.v, color.a);
  }
  const travel = Math.max(width - thumb, 0);
  const x = sign === 1 ? fraction * travel : (1 - fraction) * travel;
  return (
    <View
      id={measured.id}
      ref={innerRef}
      className="relative flex w-full flex-col justify-center"
      style={{ height: `${thumb * 2}rpx` }}
      aria-label={CHANNEL_LABEL[channel]}
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
        className={slots.track({ className: `relative ${className ?? ""}` })}
        style={{ height: `${trackHeight * 2}rpx` }}
      >
        {channel === "alpha" ? <Checkerboard /> : null}
        <View
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundImage: gradient, pointerEvents: "none" }}
        />
      </View>
      <ColorThumb
        diameter={thumb}
        x={x}
        color={thumbColor}
        className={thumbClassName}
      />
    </View>
  );
};
export const ColorPickerHue = forwardRef<
  ComponentRef<typeof View>,
  ColorPickerHueProps
>((props, ref) => <ChannelTrack {...props} channel="hue" innerRef={ref} />);
export const ColorPickerBrightness = forwardRef<
  ComponentRef<typeof View>,
  ColorPickerHueProps
>((props, ref) => (
  <ChannelTrack {...props} channel="brightness" innerRef={ref} />
));
export const ColorPickerAlpha = forwardRef<
  ComponentRef<typeof View>,
  ColorPickerHueProps
>((props, ref) => <ChannelTrack {...props} channel="alpha" innerRef={ref} />);
ColorPickerHue.displayName = "ColorPicker.Hue";
ColorPickerBrightness.displayName = "ColorPicker.Brightness";
ColorPickerAlpha.displayName = "ColorPicker.Alpha";
