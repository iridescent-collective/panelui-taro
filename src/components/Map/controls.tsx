import { View } from "@tarojs/components";
import { getLocation } from "@tarojs/taro";
import { useContext, useRef, useEffect } from "react";
import type { ReactNode } from "react";

import { useWindowMetrics } from "../../hooks/use-window-metrics";
import {
  CompassIcon,
  CrosshairIcon,
  IconColorProvider,
  MaximizeIcon,
  MinusIcon,
  PlusIcon,
} from "../../icons";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { MapReservationsContext, useMap } from "./context";
import { controlsOffsets, reservedAt, resolveMapInsets } from "./map-insets";
import { mapOffsetsStyle } from "./overlay";
import type { LngLat, MapControlsProps } from "./types";
import { mapVariants } from "./variants";

const ControlButton = ({
  label,
  onPress,
  children,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  children: ReactNode;
  disabled?: boolean;
}) => (
  <AnimatedPressable
    accessibilityRole="button"
    accessibilityLabel={label}
    disabled={disabled}
    className={mapVariants().control({
      className: disabled ? "opacity-40" : undefined,
    })}
    onPress={onPress}
  >
    {children}
  </AnimatedPressable>
);
export const MapControls = ({
  position = "bottom-right",
  inset,
  safeArea = false,
  zoom = true,
  locate = false,
  compass = false,
  recenter = false,
  className,
  onLocate,
}: MapControlsProps) => {
  const slots = mapVariants({ position });
  const ctx = useMap();
  const metrics = useWindowMetrics();
  const reservations = useContext(MapReservationsContext);
  const offsets = controlsOffsets(position, {
    gap: 12,
    inset: resolveMapInsets(
      inset,
      12,
      safeArea ? metrics.insets : { bottom: 0, left: 0, right: 0, top: 0 }
    ),
    reserved: reservedAt(position, reservations),
  });
  const tint = useThemeToken("muted-foreground");
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    []
  );
  const nudgeZoom = async (delta: number) => {
    try {
      const map = ctx.mapRef.current;
      if (!map) {
        return;
      }
      const [center, current] = await Promise.all([
        map.getCenter(),
        map.getZoom(),
      ]);
      if (mounted.current) {
        ctx.cameraRef.current?.easeTo({
          center,
          duration: 250,
          zoom: Math.min(22, Math.max(0, current + delta)),
        });
      }
    } catch (error) {
      ctx.issue({
        capability: "zoom-controls",
        message: error instanceof Error ? error.message : "Native zoom failed",
      });
    }
  };
  const handleLocate = async () => {
    try {
      const result = await getLocation({ type: "gcj02" });
      if (!mounted.current) {
        return;
      }
      const coordinate: LngLat = ctx.fromNative([
        result.longitude,
        result.latitude,
      ]);
      ctx.cameraRef.current?.flyTo({
        center: coordinate,
        duration: 900,
        zoom: 14,
      });
      onLocate?.(coordinate);
    } catch (error) {
      ctx.issue({
        capability: "location",
        message:
          error instanceof Error
            ? error.message
            : "Location is unavailable or permission was declined",
      });
    }
  };
  const resetNorth = async () => {
    try {
      const center = await ctx.mapRef.current?.getCenter();
      if (center && mounted.current) {
        ctx.cameraRef.current?.easeTo({
          bearing: 0,
          center,
          duration: 300,
          pitch: 0,
        });
      }
    } catch (error) {
      ctx.issue({
        capability: "compass",
        message:
          error instanceof Error
            ? error.message
            : "Native compass reset failed",
      });
    }
  };
  return (
    <IconColorProvider color={tint}>
      <View
        className={slots.controls({ className })}
        style={{ ...mapOffsetsStyle(offsets), pointerEvents: "auto" }}
      >
        {zoom ? (
          <View className={slots.group()}>
            <ControlButton
              label="Zoom in"
              onPress={() => {
                void nudgeZoom(1);
              }}
            >
              <PlusIcon size={16} />
            </ControlButton>
            <View className="h-[2px] bg-[var(--panel-border)]" />
            <ControlButton
              label="Zoom out"
              onPress={() => {
                void nudgeZoom(-1);
              }}
            >
              <MinusIcon size={16} strokeWidth={2} />
            </ControlButton>
          </View>
        ) : null}
        {recenter ? (
          <View className={slots.group()}>
            <ControlButton label="Recenter map" onPress={() => ctx.recenter()}>
              <MaximizeIcon size={16} />
            </ControlButton>
          </View>
        ) : null}
        {compass ? (
          <View className={slots.group()}>
            <ControlButton
              label="Face north"
              disabled={
                Math.abs(ctx.state.bearing % 360) < 0.01 &&
                Math.abs(ctx.state.pitch) < 0.01
              }
              onPress={() => {
                void resetNorth();
              }}
            >
              <CompassIcon size={16} />
            </ControlButton>
          </View>
        ) : null}
        {locate ? (
          <View className={slots.group()}>
            <ControlButton
              label="Show my location"
              onPress={() => {
                void handleLocate();
              }}
            >
              <CrosshairIcon size={16} />
            </ControlButton>
          </View>
        ) : null}
      </View>
    </IconColorProvider>
  );
};
MapControls.displayName = "Map.Controls";
