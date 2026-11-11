import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import type { ImageViewerSource } from "../ImageViewer";
import type {
  CameraFacing,
  CameraMode,
  CameraFlashMode,
  CameraTimerDelay,
} from "./camera-model";

interface CapturedPicture {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  exif?: Record<string, unknown>;
}
export interface CameraViewHandle {
  takePictureAsync(options?: object): Promise<CapturedPicture | undefined>;
  recordAsync(options?: object): Promise<{ uri: string } | undefined>;
  stopRecording(): void;
  pausePreview(): Promise<void>;
  resumePreview(): Promise<void>;
}
export interface CameraPhoto {
  type: "photo";

  uri: string;
  width: number;
  height: number;

  base64?: string;

  exif?: Record<string, unknown>;
}
export interface CameraVideo {
  type: "video";

  uri: string;

  duration: number;
}
export type CameraCapture = CameraPhoto | CameraVideo;
export interface CameraPictureOptions {
  quality?: number;

  base64?: boolean;

  exif?: boolean;

  skipProcessing?: boolean;

  shutterSound?: boolean;
}
export interface CameraViewOptions {
  videoQuality?: "2160p" | "1080p" | "720p" | "480p" | "4:3";
  videoStabilizationMode?: "off" | "standard" | "cinematic" | "auto";

  ratio?: "4:3" | "16:9" | "1:1";

  selectedLens?: string;
  pictureSize?: string;
  animateShutter?: boolean;
  [key: string]: unknown;
}
export interface CameraZoomStop {
  value: number;

  label: string;

  accessibilityLabel?: string;
}
export interface CameraState {
  facing: CameraFacing;
  mode: CameraMode;

  flash: CameraFlashMode;

  zoom: number;
  timer: CameraTimerDelay;

  ready: boolean;

  permission: { granted: boolean; canAskAgain: boolean } | null;
  recording: boolean;

  recordingSince: number | null;

  capturing: boolean;

  countdown: number | null;

  maxDuration?: number;
  setMode: (mode: CameraMode) => void;
  setFlash: (flash: CameraFlashMode) => void;
  setZoom: (zoom: number) => void;
  setTimer: (timer: CameraTimerDelay) => void;

  flip: () => void;

  press: () => void;
  takePhoto: () => Promise<CameraPhoto | null>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelCountdown: () => void;
  requestPermission: () => void;
}
export interface CameraHandle {
  takePhoto: () => Promise<CameraPhoto | null>;

  startRecording: () => Promise<void>;
  stopRecording: () => void;
  flip: () => void;

  readonly view: CameraViewHandle | null;
}
export interface CameraProps extends ComponentProps<typeof View> {
  className?: string;

  children?: ReactNode;

  facing?: CameraFacing;

  defaultFacing?: CameraFacing;

  onFacingChange?: (facing: CameraFacing) => void;

  mode?: CameraMode;

  defaultMode?: CameraMode;

  onModeChange?: (mode: CameraMode) => void;

  flash?: CameraFlashMode;

  defaultFlash?: CameraFlashMode;

  onFlashChange?: (flash: CameraFlashMode) => void;

  zoom?: number;

  defaultZoom?: number;

  onZoomChange?: (zoom: number) => void;

  timer?: CameraTimerDelay;

  defaultTimer?: CameraTimerDelay;

  onTimerChange?: (timer: CameraTimerDelay) => void;

  onCapture?: (capture: CameraCapture) => void;

  onError?: (error: Error) => void;

  maxDuration?: number;

  mute?: boolean;

  mirror?: boolean;

  pictureOptions?: CameraPictureOptions;

  cameraProps?: CameraViewOptions;

  haptics?: boolean;

  safeArea?: boolean;
}
export interface CameraPreviewProps extends ComponentProps<typeof View> {
  className?: string;

  children?: ReactNode;

  pinchToZoom?: boolean;

  doubleTapToFlip?: boolean;

  permissionTitle?: string;
  permissionDescription?: string;

  permissionAction?: string;

  settingsAction?: string;

  accessibilityLabel?: string;
}
export interface CameraHeaderProps extends ComponentProps<typeof View> {
  className?: string;
  children?: ReactNode;
}
export interface CameraFooterProps extends ComponentProps<typeof View> {
  className?: string;
  children?: ReactNode;
}
export interface CameraControlsProps extends ComponentProps<typeof View> {
  className?: string;
  children?: ReactNode;
}
export interface CameraButtonProps extends Omit<
  AnimatedPressableProps,
  "children"
> {
  className?: string;

  active?: boolean;

  children: ReactNode;
}
export interface CameraFlashProps extends Omit<
  AnimatedPressableProps,
  "children" | "onPress"
> {
  className?: string;

  labels?: Partial<Record<CameraFlashMode, string>>;
  accessibilityLabel?: string;
}
export interface CameraTimerProps extends Omit<
  AnimatedPressableProps,
  "children" | "onPress"
> {
  className?: string;

  offLabel?: string;
  accessibilityLabel?: string;
}
export interface CameraDurationProps extends ComponentProps<typeof View> {
  className?: string;

  always?: boolean;
}
export interface CameraZoomProps extends ComponentProps<typeof View> {
  className?: string;

  stops?: CameraZoomStop[];

  bar?: boolean;
}
export interface CameraModesProps extends ComponentProps<typeof View> {
  className?: string;

  labels?: Partial<Record<CameraMode, string>>;
}
export interface CameraLibraryProps extends Omit<
  AnimatedPressableProps,
  "children"
> {
  className?: string;

  source?: ImageViewerSource;
  accessibilityLabel?: string;
}
export interface CameraFlipProps extends Omit<
  AnimatedPressableProps,
  "children" | "onPress"
> {
  className?: string;
  accessibilityLabel?: string;
}
export interface CameraShutterProps extends Omit<
  AnimatedPressableProps,
  "children" | "onPress"
> {
  className?: string;

  holdToRecord?: boolean;

  onPress?: () => void;

  accessibilityLabel?: string;
}
