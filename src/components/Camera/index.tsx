import { Camera as TaroCamera, View } from "@tarojs/components";
import { createCameraContext, ENV_TYPE, getEnv } from "@tarojs/taro";
import { forwardRef, useImperativeHandle, useRef } from "react";
import type { ComponentProps } from "react";

import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { CameraIcon } from "../../icons";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { readTouchPoints } from "../../primitives/touch-event";
import { Text } from "../primitives/Text";
import { torchFor, zoomFromPinch } from "./camera-model";
import {
  CameraContext,
  CameraChromeProvider,
  useCameraChrome,
  useCameraContext,
} from "./context";
import {
  CameraHeader,
  CameraFooter,
  CameraControls,
  CameraButton,
  CameraFlash,
  CameraTimer,
  CameraDuration,
  CameraZoom,
  CameraModes,
  CameraLibrary,
  CameraFlip,
  CameraShutter,
} from "./parts";
import type { CameraProps, CameraHandle, CameraPreviewProps } from "./types";
import { useCameraModel } from "./use-camera";

export type {
  CameraViewHandle,
  CameraPhoto,
  CameraVideo,
  CameraCapture,
  CameraPictureOptions,
  CameraViewOptions,
  CameraZoomStop,
  CameraState,
  CameraHandle,
  CameraProps,
  CameraPreviewProps,
  CameraHeaderProps,
  CameraFooterProps,
  CameraControlsProps,
  CameraButtonProps,
  CameraFlashProps,
  CameraTimerProps,
  CameraDurationProps,
  CameraZoomProps,
  CameraModesProps,
  CameraLibraryProps,
  CameraFlipProps,
  CameraShutterProps,
} from "./types";
export type {
  CameraFacing,
  CameraMode,
  CameraFlashMode,
  CameraTimerDelay,
} from "./camera-model";
export { useCamera } from "./context";
export const hasCamera =
  typeof createCameraContext === "function" && getEnv() === ENV_TYPE.WEAPP;
const CAMERA_PROPS = new Set([
  "facing",
  "defaultFacing",
  "onFacingChange",
  "mode",
  "defaultMode",
  "onModeChange",
  "flash",
  "defaultFlash",
  "onFlashChange",
  "zoom",
  "defaultZoom",
  "onZoomChange",
  "timer",
  "defaultTimer",
  "onTimerChange",
  "onCapture",
  "onError",
  "maxDuration",
  "mute",
  "mirror",
  "pictureOptions",
  "cameraProps",
  "haptics",
  "safeArea",
]);
const CameraRoot = forwardRef<CameraHandle, CameraProps>((props, ref) => {
  const model = useCameraModel(props);
  const metrics = useWindowMetrics();
  useImperativeHandle(ref, () => ({
    flip: model.flip,
    startRecording: model.startRecording,
    stopRecording: model.stopRecording,
    takePhoto: model.takePhoto,
    view: model.view,
  }));
  const { className, style, children } = props;
  const hostProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => !CAMERA_PROPS.has(key))
  );
  return (
    <CameraContext.Provider value={model}>
      <CameraChromeProvider>
        <View
          {...hostProps}
          className={cn(
            "relative flex h-full w-full flex-col overflow-hidden bg-black",
            className
          )}
          style={mergeStyle(
            props.safeArea === false
              ? {}
              : {
                  paddingBottom: `${metrics.insets.bottom * 2}rpx`,
                  paddingTop: `${metrics.insets.top * 2}rpx`,
                },
            style
          )}
        >
          {children}
        </View>
      </CameraChromeProvider>
    </CameraContext.Provider>
  );
});
const CameraPreview = ({
  className,
  children,
  pinchToZoom = true,
  doubleTapToFlip = true,
  permissionTitle = "Camera access",
  permissionDescription = "Allow camera access to take photos and record video.",
  permissionAction = "Allow camera",
  settingsAction = "Open Settings",
  accessibilityLabel = "Viewfinder",
  ...props
}: CameraPreviewProps) => {
  const model = useCameraContext();
  const chrome = useCameraChrome();
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const lastTap = useRef(0);
  const begin = (event: unknown) => {
    const points = readTouchPoints(event);
    if (points.length === 2 && pinchToZoom) {
      pinch.current = {
        distance: Math.max(
          1,
          Math.hypot(
            points[1].clientX - points[0].clientX,
            points[1].clientY - points[0].clientY
          )
        ),
        zoom: model.zoom,
      };
    }
  };
  const move = (event: unknown) => {
    const points = readTouchPoints(event);
    const start = pinch.current;
    if (start && points.length === 2 && pinchToZoom) {
      model.setZoom(
        zoomFromPinch(
          start.zoom,
          Math.hypot(
            points[1].clientX - points[0].clientX,
            points[1].clientY - points[0].clientY
          ) / start.distance
        )
      );
    }
  };
  const nativeProps = model.props.cameraProps as
    | ComponentProps<typeof TaroCamera>
    | undefined;
  return (
    <View
      {...props}
      className={cn("absolute inset-0", className)}
      aria-label={accessibilityLabel}
      onTouchStart={begin}
      onTouchMove={move}
      onTouchEnd={() => {
        if (pinch.current) {
          pinch.current = null;
          return;
        }
        const now = Date.now();
        if (doubleTapToFlip && now - lastTap.current < 300) {
          model.flip();
          lastTap.current = 0;
        } else {
          lastTap.current = now;
        }
      }}
    >
      {model.permission?.granted && !model.paused ? (
        <TaroCamera
          {...nativeProps}
          key={model.facing}
          id={model.id}
          className="absolute inset-0 h-full w-full"
          devicePosition={model.facing}
          mode="normal"
          flash={
            model.mode === "photo"
              ? model.flash
              : torchFor(model.mode, model.flash, model.recording)
                ? "torch"
                : "off"
          }
          onInitDone={(event) => {
            model.initialize(event.detail.maxZoom);
            nativeProps?.onInitDone?.(event);
          }}
          onError={(event) => {
            model.setReady(false);
            model.error(event.detail);
            nativeProps?.onError?.(event);
          }}
          onStop={(event) => {
            model.stopRecording();
            model.cancelCountdown();
            model.setReady(false);
            nativeProps?.onStop?.(event);
          }}
        />
      ) : (
        <View
          className="absolute inset-x-0 flex flex-col items-center justify-center gap-[24px] px-[80px]"
          style={{
            top: `${chrome.header * 2}rpx`,
            bottom: `${chrome.footer * 2}rpx`,
          }}
        >
          <View aria-hidden className="opacity-60">
            <CameraIcon size={32} color="#ffffff" />
          </View>
          <Text size="lg" className="text-center text-white" weight="semibold">
            {permissionTitle}
          </Text>
          <Text className="text-center text-white/70" size="sm">
            {permissionDescription}
          </Text>
          <AnimatedPressable
            accessibilityRole="button"
            className="mt-[16px] flex h-[88px] items-center justify-center rounded-full bg-white px-[40px]"
            accessibilityLabel={
              model.permission?.canAskAgain === false
                ? settingsAction
                : permissionAction
            }
            onPress={model.requestPermission}
          >
            <Text className="text-black" size="sm" weight="semibold">
              {model.permission?.canAskAgain === false
                ? settingsAction
                : permissionAction}
            </Text>
          </AnimatedPressable>
        </View>
      )}
      {children}
      {model.countdown === null ? null : (
        <View
          className="absolute inset-0 flex items-center justify-center"
          aria-live="polite"
        >
          <Text className="text-[144px] text-white">{model.countdown}</Text>
        </View>
      )}
    </View>
  );
};
export const Camera = Object.assign(CameraRoot, {
  Button: CameraButton,
  Controls: CameraControls,
  Duration: CameraDuration,
  Flash: CameraFlash,
  Flip: CameraFlip,
  Footer: CameraFooter,
  Header: CameraHeader,
  Library: CameraLibrary,
  Modes: CameraModes,
  Preview: CameraPreview,
  Shutter: CameraShutter,
  Timer: CameraTimer,
  Zoom: CameraZoom,
});
