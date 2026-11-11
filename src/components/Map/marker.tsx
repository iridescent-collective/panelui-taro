import { View } from "@tarojs/components";
import type { ReactNode } from "react";
import { Children, isValidElement, useContext, useState } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text, textChildren } from "../primitives/Text";
import { MarkerContext, useMap } from "./context";
import { asMapLayer } from "./map-children";
import type { MapLabelProps, MapMarkerProps, MapPopupProps } from "./types";
import { useMapPoint } from "./use-projection";
import { mapVariants } from "./variants";

const ANCHOR = {
  bottom: [0.5, 1],
  center: [0.5, 0.5],
  left: [0, 0.5],
  right: [1, 0.5],
  top: [0.5, 0],
} as const;
const LABEL_SIZE = { md: "px-[16px] py-[4px]", sm: "px-[12px] py-[2px]" };
const LABEL_TONE = {
  default: { pill: "", text: "" },
  muted: { pill: "", text: "text-[var(--panel-muted-foreground)]" },
  primary: {
    pill: "border-[var(--panel-primary)]/24 bg-[var(--panel-primary)]",
    text: "text-[var(--panel-primary-foreground)]",
  },
};
export const MapLabel = ({
  children,
  className,
  side = "bottom",
  size = "md",
  tone = "default",
}: MapLabelProps) => {
  const slots = mapVariants();
  const shade = LABEL_TONE[tone];
  return (
    <View
      className={cn(
        "absolute flex flex-col items-center",
        side === "top" ? "bottom-full mb-[12px]" : "top-full mt-[12px]"
      )}
      style={{ left: "-240rpx", pointerEvents: "none", right: "-240rpx" }}
    >
      <View
        className={slots.label({
          className: cn(LABEL_SIZE[size], shade.pill, className),
        })}
      >
        {textChildren(children, (text) => (
          <Text
            size="xs"
            weight="medium"
            numberOfLines={1}
            className={slots.labelText({ className: shade.text })}
          >
            {text}
          </Text>
        ))}
      </View>
    </View>
  );
};
MapLabel.displayName = "Map.Label";
export const MapPopup = asMapLayer(
  ({ children, className, title, lngLat }: MapPopupProps) => {
    const marker = useContext(MarkerContext);
    const map = useMap();
    const point = useMapPoint(lngLat ?? marker ?? undefined);
    if (!point) {
      return null;
    }
    return (
      <View
        className="absolute"
        style={{
          left: `${point[0] * 2}rpx`,
          maxWidth: `${Math.max(0, map.width - 24) * 2}rpx`,
          pointerEvents: "auto",
          top: `${point[1] * 2}rpx`,
          transform: "translate(-50%, -100%)",
          width: "max-content",
        }}
      >
        <View
          className={cn(
            "mb-[16px] flex flex-col items-center",
            mapVariants().popup({ className })
          )}
        >
          {title ? (
            <Text size="sm" weight="medium">
              {title}
            </Text>
          ) : null}
          {textChildren(children)}
        </View>
      </View>
    );
  }
);
MapPopup.displayName = "Map.Popup";
export const MapMarker = asMapLayer(
  ({
    lngLat,
    anchor = "center",
    onPress,
    className,
    children,
    accessibilityState,
    ...props
  }: MapMarkerProps) => {
    const [open, setOpen] = useState(false);
    const point = useMapPoint(lngLat);
    const layout = useElementLayout(true, children, undefined, false);
    const slots = mapVariants();
    const popups: ReactNode[] = [];
    const labels: ReactNode[] = [];
    const content: ReactNode[] = [];
    for (const child of Children.toArray(children)) {
      if (isValidElement(child) && child.type === MapPopup) {
        popups.push(child);
      } else if (isValidElement(child) && child.type === MapLabel) {
        labels.push(child);
      } else {
        content.push(child);
      }
    }
    if (!point) {
      return null;
    }
    const pressable = Boolean(onPress || popups.length);
    const body = (
      <View
        id={layout.id}
        className={cn("relative flex flex-col items-center", className)}
      >
        {content.length ? content : <View className={slots.pin()} />} {labels}
      </View>
    );
    const offset = ANCHOR[anchor];
    return (
      <MarkerContext.Provider value={lngLat}>
        <View
          className="absolute"
          style={{
            left: `${point[0] * 2}rpx`,
            pointerEvents: "auto",
            top: `${point[1] * 2}rpx`,
            transform: `translate(${-offset[0] * 100}%, ${-offset[1] * 100}%)`,
          }}
        >
          {pressable ? (
            <AnimatedPressable
              {...props}
              accessibilityRole="button"
              accessibilityState={
                popups.length
                  ? { ...accessibilityState, expanded: open }
                  : accessibilityState
              }
              onPress={() => {
                if (popups.length) {
                  setOpen((value) => !value);
                }
                onPress?.();
              }}
            >
              {body}
            </AnimatedPressable>
          ) : (
            <View aria-label={props.accessibilityLabel}>{body}</View>
          )}
        </View>
        {open ? popups : null}
      </MarkerContext.Provider>
    );
  }
);
MapMarker.displayName = "Map.Marker";
