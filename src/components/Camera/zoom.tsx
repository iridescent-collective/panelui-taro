import { Slider, View } from "@tarojs/components";
import { useState } from "react";

import { selectionTick } from "../../lib/haptics";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { activeStop } from "./camera-model";
import { useCameraContext } from "./context";
import type { CameraZoomStop, CameraZoomProps } from "./types";

const ZOOM_BAR_WIDTH = 200;
const ZOOM_TICKS = 21;
const DEFAULT_ZOOM_STOPS: CameraZoomStop[] = [{ label: "1×", value: 0 }];

export const CameraZoom = ({
  stops = DEFAULT_ZOOM_STOPS,
  bar = true,
  className,
  ...props
}: CameraZoomProps) => {
  const camera = useCameraContext();
  const [dragging, setDragging] = useState(false);
  const at = activeStop(camera.zoom, stops);
  return (
    <View
      {...props}
      className={cn("flex flex-col items-center gap-[16px]", className)}
    >
      {bar && (camera.zoom > 0.005 || dragging) ? (
        <View
          className="relative flex flex-row items-center justify-between"
          style={{ width: `${ZOOM_BAR_WIDTH * 2}rpx`, height: "56rpx" }}
        >
          <View
            aria-hidden
            className="pointer-events-none absolute inset-0 flex flex-row items-center justify-between"
          >
            {Array.from({ length: ZOOM_TICKS }, (_, index) => (
              <View
                key={index}
                className={
                  index % 5 === 0
                    ? "h-[24px] w-[2px] bg-white/80"
                    : "h-[16px] w-[2px] bg-white/40"
                }
              />
            ))}
            <View
              className="absolute top-[4px] bottom-[4px] w-[4px] rounded-full bg-white"
              style={{ left: `${(camera.zoom * ZOOM_BAR_WIDTH - 1) * 2}rpx` }}
            />
          </View>
          <Slider
            aria-role="slider"
            aria-label="Zoom"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(camera.zoom * 100)}
            min={0}
            max={100}
            step={1}
            value={Math.round(camera.zoom * 100)}
            className="absolute inset-0 m-0 h-full w-full opacity-0"
            style={{ margin: 0 }}
            onTouchStart={() => setDragging(true)}
            onTouchEnd={() => setDragging(false)}
            onTouchCancel={() => setDragging(false)}
            onChanging={(event) => {
              setDragging(true);
              camera.setZoom(event.detail.value / 100);
            }}
            onChange={(event) => {
              camera.setZoom(event.detail.value / 100);
              setDragging(false);
            }}
          />
        </View>
      ) : null}
      <View className="flex flex-row items-center gap-[8px] rounded-full bg-black/40 p-[8px]">
        {stops.map((stop, index) => {
          const selected = index === at;
          return (
            <AnimatedPressable
              key={`${stop.label}-${index}`}
              hitSlop={4}
              pressScale={0.92}
              accessibilityRole="button"
              accessibilityLabel={
                stop.accessibilityLabel ?? `Zoom ${stop.label}`
              }
              accessibilityState={{ selected }}
              onPress={() => {
                if (camera.haptics) void selectionTick();
                camera.setZoom(stop.value);
              }}
              className={cn(
                "flex h-[64px] min-w-[64px] items-center justify-center rounded-full px-[16px]",
                selected && "bg-white"
              )}
            >
              <Text
                size="xs"
                weight="semibold"
                className={selected ? "text-black" : "text-white"}
              >
                {stop.label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
};
