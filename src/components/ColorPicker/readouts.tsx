import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { formatColor, hsvToCss } from "../../lib/color";
import { Text } from "../primitives/Text";
import { CHANNEL_LABEL, FIELD_SWATCH, PREVIEW_SWATCH } from "./constants";
import { useColorFrame } from "./context";
import { Checkerboard } from "./drawing";
import type {
  ColorPickerChannelProps,
  ColorPickerFieldProps,
  ColorPickerPreviewProps,
} from "./types";
import { colorPickerVariants } from "./variants";

export const ColorPickerPreview = forwardRef<
  ComponentRef<typeof View>,
  ColorPickerPreviewProps
>(
  (
    { className, showValue = false, swatchClassName, valueClassName, children },
    ref
  ) => {
    const { ctx, color } = useColorFrame();
    const slots = colorPickerVariants({ size: ctx.size });
    const diameter = PREVIEW_SWATCH[ctx.size];
    return (
      <View ref={ref} className={slots.preview({ className })}>
        <View
          className={slots.previewSwatch({
            className: `relative ${swatchClassName ?? ""}`,
          })}
          style={{ height: `${diameter * 2}rpx`, width: `${diameter * 2}rpx` }}
        >
          <Checkerboard square={5} />
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: hsvToCss(color.h, color.s, color.v, color.a),
            }}
          />
        </View>
        {showValue ? (
          <Text className={slots.previewValue({ className: valueClassName })}>
            {formatColor(color, ctx.format)}
          </Text>
        ) : null}
        {children}
      </View>
    );
  }
);
export const ColorPickerField = forwardRef<
  ComponentRef<typeof View>,
  ColorPickerFieldProps
>(
  (
    {
      className,
      label,
      showValue = true,
      swatchClassName,
      onPress,
      onClick,
      children,
    },
    ref
  ) => {
    const { ctx, color } = useColorFrame();
    const slots = colorPickerVariants({ size: ctx.size });
    const diameter = FIELD_SWATCH[ctx.size];
    const printed = formatColor(color, ctx.format);
    const press = onClick ?? onPress;
    return (
      <View
        ref={ref}
        className={slots.field({ className })}
        aria-role={press ? "button" : undefined}
        aria-label={label ? `${label}, ${printed}` : printed}
        aria-disabled={press ? ctx.disabled : undefined}
        onClick={press && !ctx.disabled ? (event) => press(event) : undefined}
      >
        {label ? <Text className={slots.fieldLabel()}>{label}</Text> : null}
        {showValue ? (
          <Text className={slots.fieldValue()}>{printed.toUpperCase()}</Text>
        ) : null}
        <View
          className={slots.fieldSwatch({
            className: `relative ${swatchClassName ?? ""}`,
          })}
          style={{ height: `${diameter * 2}rpx`, width: `${diameter * 2}rpx` }}
        >
          <Checkerboard square={4} />
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: hsvToCss(color.h, color.s, color.v, color.a),
            }}
          />
        </View>
        {children}
      </View>
    );
  }
);
export const ColorPickerChannelReadout = forwardRef<
  ComponentRef<typeof View>,
  ColorPickerChannelProps
>(({ className, channel, label, format }, ref) => {
  const { ctx, color } = useColorFrame();
  const slots = colorPickerVariants({ size: ctx.size });
  const channels = {
    alpha: color.a * 100,
    brightness: color.v * 100,
    hue: color.h,
    saturation: color.s * 100,
  };
  const value = Math.round(channels[channel]);
  const defaultText = channel === "hue" ? `${value}°` : `${value}%`;
  return (
    <View ref={ref} className={slots.channel({ className })}>
      <Text className={slots.channelValue()}>
        {format ? format(value) : defaultText}
      </Text>
      <Text className={slots.channelLabel()}>
        {label ?? CHANNEL_LABEL[channel]}
      </Text>
    </View>
  );
});
ColorPickerPreview.displayName = "ColorPicker.Preview";
ColorPickerField.displayName = "ColorPicker.Field";
ColorPickerChannelReadout.displayName = "ColorPicker.Channel";
