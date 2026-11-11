import { Image, View } from "@tarojs/components";
import { showActionSheet } from "@tarojs/taro";
import { useEffect, useMemo, useRef } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { useCropper } from "./context";
import { maskPath, minScale, normalizeDegrees } from "./math";
import type { AvatarCropperCanvasProps } from "./types";
import { useCropGesture } from "./use-gesture";

export const AvatarCropperCanvas = ({
  className,
  accessibilityLabel = "Photo crop",
  id,
  style,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  onLongPress,
  ...props
}: AvatarCropperCanvasProps) => {
  const cropper = useCropper("AvatarCropper.Canvas");
  const latest = useRef(cropper);
  latest.current = cropper;
  const live = useRef(true);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  const adjust = async () => {
    const requested = latest.current;
    try {
      const { tapIndex } = await showActionSheet({
        itemList: ["Zoom in", "Zoom out", "Rotate"],
      });
      const owner = latest.current;
      if (
        !live.current ||
        owner.source.uri !== requested.source.uri ||
        owner.bounds !== requested.bounds ||
        owner.frame !== requested.frame
      ) {
        return;
      }
      if (tapIndex === 0) {
        owner.zoomBy(1.25);
      } else if (tapIndex === 1) {
        owner.zoomBy(1 / 1.25);
      } else if (tapIndex === 2) {
        owner.rotate(1);
      }
    } catch {
      return false;
    }
  };
  const { frame, state, source, fill, bounds, setCanvas } = cropper;
  const input = useMemo(() => ({ className, style }), [className, style]);
  const measured = useElementLayout(true, input, id, false);
  const gesture = useCropGesture(cropper, measured.refresh);
  const scrim = useThemeToken("background");
  const ring = useThemeToken("foreground");
  const width = measured.layout?.width ?? 0;
  const height = measured.layout?.height ?? 0;
  useEffect(() => {
    if (width > 0 && height > 0) {
      setCanvas({ height, width });
    }
  }, [width, height, setCanvas]);
  const outline = frame
    ? maskPath(cropper.shape, width / 2, height / 2, frame.mask)
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="M0 0H${width}V${height}H0Z${outline}" fill="${scrim}" fill-opacity="0.78" fill-rule="evenodd"/><path d="${outline}" fill="none" stroke="${ring}" stroke-opacity="0.9" stroke-width="1.5"/></svg>`;
  const angle = Math.round(normalizeDegrees(state.rotation));
  const summary = `${Math.round(state.scale * 100)}% zoom${angle ? `, turned ${angle} degrees` : ""}`;
  return (
    <View
      {...props}
      id={measured.id}
      className={cn(
        "bg-background relative flex min-h-0 flex-1 overflow-hidden",
        className
      )}
      style={style}
      role="slider"
      aria-role="adjustable"
      aria-label={accessibilityLabel}
      aria-valuetext={summary}
      aria-valuenow={Math.round(state.scale * 100)}
      aria-valuemin={
        frame ? Math.round(minScale(bounds, frame, state.rotation) * 100) : 100
      }
      aria-valuemax={Math.round(bounds.maxZoom * 100)}
      aria-description="Drag to move, pinch to zoom and twist to turn. Touch and hold for zoom and rotation actions."
      onLongPress={async (event) => {
        onLongPress?.(event);
        await adjust();
      }}
      catchMove
      onTouchStart={(event) => {
        onTouchStart?.(event);
        gesture.onTouchStart(event);
      }}
      onTouchMove={(event) => {
        onTouchMove?.(event);
        gesture.onTouchMove(event);
      }}
      onTouchEnd={(event) => {
        onTouchEnd?.(event);
        gesture.onTouchEnd(event);
      }}
      onTouchCancel={(event) => {
        onTouchCancel?.(event);
        gesture.onTouchCancel();
      }}
    >
      {frame ? (
        <>
          {!bounds.cover && fill !== "transparent" ? (
            <View
              style={{
                background: fill,
                height: `${frame.mask * 2}rpx`,
                left: `${width - frame.mask}rpx`,
                pointerEvents: "none",
                position: "absolute",
                top: `${height - frame.mask}rpx`,
                width: `${frame.mask * 2}rpx`,
              }}
            />
          ) : null}
          <Image
            src={source.uri}
            mode="scaleToFill"
            aria-hidden
            style={{
              height: `${frame.image.height * 2}rpx`,
              left: `${width - frame.image.width}rpx`,
              pointerEvents: "none",
              position: "absolute",
              top: `${height - frame.image.height}rpx`,
              transform: `translate(${state.x * 2}rpx, ${state.y * 2}rpx) rotate(${state.rotation}deg) scale(${state.scale})`,
              transition: "none",
              width: `${frame.image.width * 2}rpx`,
            }}
          />
          <Image
            src={`data:image/svg+xml,${encodeURIComponent(svg)}`}
            mode="scaleToFill"
            aria-hidden
            style={mergeStyle({
              height: "100%",
              left: 0,
              pointerEvents: "none",
              position: "absolute",
              top: 0,
              width: "100%",
            })}
          />
        </>
      ) : null}
    </View>
  );
};
AvatarCropperCanvas.displayName = "AvatarCropper.Canvas";
