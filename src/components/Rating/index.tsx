import { View } from "@tarojs/components";
import { forwardRef, useState } from "react";
import type { ComponentRef } from "react";

import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import {
  normalizeRatingMax,
  normalizeRatingPrecision,
  normalizeRatingValue,
} from "./inputs";
import { RatingStar } from "./star";
import type { RatingProps, RatingSize } from "./types";
import { useRatingGesture } from "./use-rating-gesture";
import { ratingVariants } from "./variants";

export type { RatingProps, RatingSize, RatingColor } from "./types";
const STAR_SIZE: Record<RatingSize, number> = { lg: 32, md: 24, sm: 18 };
const STAR_GAP: Record<RatingSize, number> = { lg: 6, md: 4, sm: 2 };
const RatingHeader = ({
  label,
  shown,
  showValue,
  className,
  slots,
}: {
  label?: string;
  shown: string;
  showValue: boolean;
  className?: string;
  slots: ReturnType<typeof ratingVariants>;
}) =>
  label || showValue ? (
    <View className={slots.header({ className })}>
      {label ? <Text className={slots.label()}>{label}</Text> : <View />}
      {showValue ? <Text className={slots.value()}>{shown}</Text> : null}
    </View>
  ) : null;
export const Rating = forwardRef<ComponentRef<typeof View>, RatingProps>(
  (
    {
      id,
      className,
      headerClassName,
      rowClassName,
      value: valueProp,
      defaultValue = 0,
      max: maxProp = 5,
      precision: precisionProp = 1,
      onValueChange,
      onValueCommit,
      readOnly = false,
      disabled = false,
      allowClear = false,
      color = "warning",
      size = "md",
      label,
      showValue = false,
      formatValue,
      haptics = false,
    },
    ref
  ) => {
    const max = normalizeRatingMax(maxProp);
    const precision = normalizeRatingPrecision(precisionProp);
    const [internal, setInternal] = useState(() =>
      normalizeRatingValue(defaultValue, max)
    );
    const controlled = valueProp !== undefined;
    const value = normalizeRatingValue(controlled ? valueProp : internal, max);
    const interactive = !readOnly && !disabled;
    const slots = ratingVariants({ disabled, size });
    const fill = useThemeToken(color);
    const empty = useThemeToken("border");
    const gesture = useRatingGesture({
      allowClear,
      haptics,
      interactive,
      max,
      onChange: (next) => {
        if (!controlled) {
          setInternal(next);
        }
        onValueChange?.(next);
      },
      onCommit: onValueCommit,
      precision,
      value,
    });
    const shown = formatValue ? formatValue(value) : String(value);
    return (
      <View
        id={id}
        ref={ref}
        className={cn("flex flex-col", slots.root({ className }))}
      >
        <RatingHeader
          label={label}
          shown={shown}
          showValue={showValue}
          className={headerClassName}
          slots={slots}
        />
        <View
          className="self-start"
          role={interactive ? "slider" : "img"}
          aria-role={interactive ? "slider" : "image"}
          aria-label={label ?? `Rating, ${shown} out of ${max}`}
          aria-disabled={disabled}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={shown}
          onTouchStart={gesture.onTouchStart}
          onTouchMove={gesture.onTouchMove}
          onTouchEnd={gesture.onTouchEnd}
          onTouchCancel={gesture.onTouchCancel}
        >
          <View
            id={gesture.id}
            className={slots.row({ className: rowClassName })}
          >
            {Array.from({ length: max }, (_, index) => (
              <RatingStar
                key={index}
                index={index}
                display={gesture.display}
                size={STAR_SIZE[size]}
                gap={index === max - 1 ? 0 : STAR_GAP[size]}
                fillColor={fill}
                emptyColor={empty}
                dragging={gesture.dragging}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }
);
