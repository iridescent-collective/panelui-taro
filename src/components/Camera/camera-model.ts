export type CameraFacing = "back" | "front";
export type CameraMode = "photo" | "video";
export type CameraFlashMode = "off" | "auto" | "on";
export type CameraTimerDelay = 0 | 3 | 10;
export const CAMERA_TIMERS: readonly CameraTimerDelay[] = [0, 3, 10];
export const PINCH_ZOOM_SENSITIVITY = 0.5;
export const ZOOM_STEP = 0.1;
export const clampZoom = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
};
export const zoomFromPinch = (startZoom: number, scale: number): number => {
  return clampZoom(startZoom + (scale - 1) * PINCH_ZOOM_SENSITIVITY);
};
export const zoomFromTrack = (x: number, width: number): number => {
  if (!(width > 0)) {
    return 0;
  }
  return clampZoom(x / width);
};
export const stepZoom = (zoom: number, direction: 1 | -1): number => {
  const next =
    Math.round((clampZoom(zoom) + direction * ZOOM_STEP) * 100) / 100;
  return clampZoom(next);
};
export const activeStop = (
  zoom: number,
  stops: readonly {
    value: number;
  }[]
): number => {
  for (let index = 0; index < stops.length; index += 1) {
    if (Math.abs(clampZoom(stops[index]?.value ?? 0) - zoom) < 0.005) {
      return index;
    }
  }
  return -1;
};
export const formatDuration = (ms: number): string => {
  const total = Number.isFinite(ms) && ms > 0 ? Math.floor(ms / 1000) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
};
export const flashIn = (
  mode: CameraMode,
  flash: CameraFlashMode
): CameraFlashMode => {
  return mode === "video" && flash === "auto" ? "off" : flash;
};
export const nextFlash = (
  mode: CameraMode,
  flash: CameraFlashMode
): CameraFlashMode => {
  const current = flashIn(mode, flash);
  if (mode === "video") {
    return current === "on" ? "off" : "on";
  }
  if (current === "off") {
    return "auto";
  }
  if (current === "auto") {
    return "on";
  }
  return "off";
};
export const stillFlash = (
  mode: CameraMode,
  flash: CameraFlashMode
): CameraFlashMode => {
  return mode === "video" ? "off" : flash;
};
export const torchFor = (
  mode: CameraMode,
  flash: CameraFlashMode,
  recording: boolean
): boolean => {
  return mode === "video" && flash === "on" && recording;
};
export const nextTimer = (timer: CameraTimerDelay): CameraTimerDelay => {
  const index = CAMERA_TIMERS.indexOf(timer);
  return CAMERA_TIMERS[(index + 1) % CAMERA_TIMERS.length] ?? 0;
};
export const recordingProgress = (
  elapsedMs: number,
  maxDurationSeconds?: number
): number => {
  if (!maxDurationSeconds || maxDurationSeconds <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, elapsedMs / (maxDurationSeconds * 1000)));
};
