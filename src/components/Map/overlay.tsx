import { View } from "@tarojs/components";
import { useContext, useEffect, useId } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { textChildren } from "../primitives/Text";
import { MapReserveContext } from "./context";
import {
  overlayOffsets,
  overlayReservation,
  resolveMapInsets,
} from "./map-insets";
import type { MapOffsets } from "./map-insets";
import type { MapOverlayProps } from "./types";
import { mapVariants } from "./variants";

export const mapOffsetsStyle = (offsets: MapOffsets) =>
  Object.fromEntries(
    Object.entries(offsets).map(([side, value]) => [side, `${value * 2}rpx`])
  );
export const MapOverlay = ({
  position = "bottom",
  inset,
  safeArea = false,
  className,
  style,
  children,
  ...props
}: MapOverlayProps) => {
  const id = useId();
  const reserve = useContext(MapReserveContext);
  const metrics = useWindowMetrics();
  const measured = useElementLayout(true, children, undefined, false);
  const insets = resolveMapInsets(
    inset,
    12,
    safeArea ? metrics.insets : { bottom: 0, left: 0, right: 0, top: 0 }
  );
  const { top, right, bottom, left } = insets;
  const height = measured.layout?.height ?? 0;
  useEffect(() => {
    reserve?.(
      id,
      overlayReservation(position, { bottom, left, right, top }, height)
    );
  }, [reserve, id, position, top, right, bottom, left, height]);
  useEffect(() => () => reserve?.(id, null), [reserve, id]);
  const offsets = mapOffsetsStyle(overlayOffsets(position, insets));
  const moved =
    typeof style === "string"
      ? `${Object.entries(offsets)
          .map(([key, value]) => `${key}:${value};`)
          .join("")}pointer-events:auto;${style}`
      : { ...offsets, pointerEvents: "auto" as const, ...style };
  return (
    <View
      {...props}
      id={measured.id}
      className={mapVariants().overlay({ className })}
      style={moved}
    >
      {textChildren(children)}
    </View>
  );
};
MapOverlay.displayName = "Map.Overlay";
