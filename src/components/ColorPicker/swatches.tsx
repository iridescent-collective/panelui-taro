import { View } from "@tarojs/components";
import { forwardRef, useEffect, useSyncExternalStore } from "react";
import type { ComponentRef } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { hsvToHex, parseColor } from "../../lib/color";
import type { HsvaColor } from "../../lib/color";
import { selectionTick } from "../../lib/haptics";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useChartTween } from "../../primitives/chart-tween";
import { SWATCH } from "./constants";
import { useColorFrame } from "./context";
import { Checkerboard } from "./drawing";
import type { ColorPickerSwatchesProps } from "./types";
import { colorPickerVariants } from "./variants";

const Swatch = ({
  color,
  diameter,
  className,
}: {
  color: HsvaColor;
  diameter: number;
  className?: string;
}) => {
  const { ctx, color: current } = useColorFrame();
  const slots = colorPickerVariants({ size: ctx.size });
  const hex = hsvToHex(color.h, color.s, color.v, color.a);
  const selected = hsvToHex(current.h, current.s, current.v, current.a) === hex;
  const reduced = usePanelReducedMotion();
  const ring = useChartTween(selected ? 1 : 0);
  useEffect(() => {
    ring.timingTo(selected ? 1 : 0, reduced ? 0 : 120);
  }, [selected, reduced, ring.timingTo]);
  const opacity = useSyncExternalStore(
    ring.signal.subscribe,
    ring.signal.getSnapshot,
    ring.signal.getSnapshot
  );
  return (
    <AnimatedPressable
      disabled={ctx.disabled}
      accessibilityRole="button"
      accessibilityLabel={hex}
      onPress={() => {
        ctx.emit(color, true);
        if (ctx.haptics) {
          void selectionTick();
        }
      }}
      className={slots.swatch({ className: `flex ${className ?? ""}` })}
      style={{ height: `${diameter * 2}rpx`, width: `${diameter * 2}rpx` }}
    >
      <View className="absolute inset-0 overflow-hidden rounded-full">
        {color.a < 1 ? <Checkerboard square={4} /> : null}
        <View className="absolute inset-0" style={{ backgroundColor: hex }} />
      </View>
      <View
        aria-hidden
        className={slots.swatchRing()}
        style={{
          height: `${(diameter + 6) * 2}rpx`,
          opacity,
          pointerEvents: "none",
          width: `${(diameter + 6) * 2}rpx`,
        }}
      />
    </AnimatedPressable>
  );
};
export const ColorPickerSwatches = forwardRef<
  ComponentRef<typeof View>,
  ColorPickerSwatchesProps
>(({ className, colors, swatchSize, swatchClassName }, ref) => {
  const { ctx } = useColorFrame();
  const slots = colorPickerVariants({ size: ctx.size });
  const diameter = swatchSize ?? SWATCH[ctx.size];
  return (
    <View ref={ref} className={slots.swatches({ className })}>
      {colors.map((raw, index) => {
        const color = parseColor(raw);
        return color ? (
          <Swatch
            key={`${raw}-${index}`}
            color={color}
            diameter={diameter}
            className={swatchClassName}
          />
        ) : null;
      })}
    </View>
  );
});
ColorPickerSwatches.displayName = "ColorPicker.Swatches";
