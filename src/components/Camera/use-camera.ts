import {
  authorize,
  createCameraContext,
  getFileSystemManager,
  getImageInfo,
  getSetting,
  openSetting,
} from "@tarojs/taro";
import { useEffect, useId, useRef, useState } from "react";

import { selectionTick } from "../../lib/haptics";
import { useControllableState } from "../../primitives/controllable-state";
import { clampZoom } from "./camera-model";
import type { CameraContextValue } from "./context";
import type {
  CameraProps,
  CameraPhoto,
  CameraVideo,
  CameraViewHandle,
} from "./types";

export const useCameraModel = (props: CameraProps): CameraContextValue => {
  const id = `panelui-camera-${useId().replaceAll(":", "")}`;
  const [native] = useState(() => createCameraContext(id));
  const { value: facing, setValue: setFacing } = useControllableState({
    defaultValue: props.defaultFacing ?? "back",
    onChange: props.onFacingChange,
    value: props.facing,
  });
  const { value: mode, setValue: changeMode } = useControllableState({
    defaultValue: props.defaultMode ?? "photo",
    onChange: props.onModeChange,
    value: props.mode,
  });
  const { value: flash, setValue: setFlash } = useControllableState({
    defaultValue: props.defaultFlash ?? "off",
    onChange: props.onFlashChange,
    value: props.flash,
  });
  const { value: zoom, setValue: changeZoom } = useControllableState({
    defaultValue: props.defaultZoom ?? 0,
    onChange: props.onZoomChange,
    value: props.zoom,
  });
  const { value: timer, setValue: setTimer } = useControllableState({
    defaultValue: props.defaultTimer ?? 0,
    onChange: props.onTimerChange,
    value: props.timer,
  });
  const [ready, setReady] = useState(false);
  const [permission, setPermission] =
    useState<CameraContextValue["permission"]>(null);
  const [maxZoom, setMaxZoom] = useState(1);
  const [paused, setPaused] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [recordingSince, setRecordingSince] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const alive = useRef(true);
  const busy = useRef(false);
  const starting = useRef(false);
  const stopping = useRef(false);
  const since = useRef<number | null>(null);
  const cap = useRef<ReturnType<typeof setTimeout> | undefined>();
  const clock = useRef<ReturnType<typeof setInterval> | undefined>();
  const recordRevision = useRef(0);
  const previousFacing = useRef(facing);
  const recordingDone = useRef<((capture?: CameraVideo) => void) | undefined>();
  const latest = useRef(props);
  latest.current = props;
  const error = (value: unknown) => {
    if (alive.current) {
      (latest.current.onError ?? console.warn)(
        value instanceof Error
          ? value
          : new Error(
              typeof value === "string"
                ? value
                : String(
                    (value as { errMsg?: string })?.errMsg ??
                      "The camera failed."
                  )
            )
      );
    }
  };
  const readPermission = () => {
    void getSetting()
      .then((result) => {
        if (alive.current) {
          const granted = result.authSetting["scope.camera"];
          setPermission({
            canAskAgain: granted !== false,
            granted: granted === true,
          });
        }
      })
      .catch(error);
  };
  const requestPermission = () => {
    const request =
      permission?.canAskAgain === false
        ? openSetting()
        : authorize({ scope: "scope.camera" });
    void request.then(readPermission).catch((error_) => {
      if (alive.current) setPermission({ granted: false, canAskAgain: false });
      error(error_);
    });
  };
  const finishVideo = (result: { tempVideoPath: string }) => {
    if (since.current === null) {
      return;
    }
    const capture: CameraVideo = {
      duration: Date.now() - since.current,
      type: "video",
      uri: result.tempVideoPath,
    };
    since.current = null;
    starting.current = false;
    stopping.current = false;
    clearTimeout(cap.current);
    const done = recordingDone.current;
    recordingDone.current = undefined;
    try {
      if (alive.current) {
        setRecordingSince(null);
        latest.current.onCapture?.(capture);
      }
    } catch (error_) {
      error(error_);
    } finally {
      done?.(capture);
    }
  };
  const failVideo = (e: unknown) => {
    starting.current = false;
    stopping.current = false;
    since.current = null;
    clearTimeout(cap.current);
    if (alive.current) {
      setRecordingSince(null);
    }
    recordingDone.current?.();
    recordingDone.current = undefined;
    error(e);
  };
  const stopRecording = () => {
    if (starting.current && since.current === null) {
      recordRevision.current += 1;
      recordingDone.current?.();
      recordingDone.current = undefined;
      return;
    }
    if (since.current === null || stopping.current) {
      return;
    }
    stopping.current = true;
    native.stopRecord({
      fail: (e) => {
        stopping.current = false;
        error(e);
      },
      success: finishVideo,
    });
  };
  const cancelCountdown = () => {
    clearInterval(clock.current);
    if (alive.current) {
      setCountdown(null);
    }
  };
  const takePhoto = async (): Promise<CameraPhoto | null> => {
    if (
      !ready ||
      paused ||
      busy.current ||
      starting.current ||
      since.current !== null ||
      !permission?.granted
    ) {
      return null;
    }
    cancelCountdown();
    busy.current = true;
    setCapturing(true);
    try {
      if (
        latest.current.pictureOptions?.exif ||
        latest.current.mirror ||
        latest.current.pictureOptions?.skipProcessing ||
        latest.current.pictureOptions?.shutterSound === false
      ) {
        throw new Error(
          "Camera: EXIF, mirroring, skipProcessing and shutter-sound control are unavailable in WeChat."
        );
      }
      const quality = latest.current.pictureOptions?.quality ?? 1;
      if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
        throw new Error("Camera quality must be between 0 and 1.");
      }
      if (
        Object.keys(latest.current.cameraProps ?? {}).some(
          (key) => !["resolution", "frameSize"].includes(key)
        )
      ) {
        throw new Error(
          "Camera: only resolution and frameSize cameraProps are supported by the WeChat adapter."
        );
      }
      const photo = await new Promise<{ tempImagePath: string }>(
        (resolve, reject) =>
          native.takePhoto({
            fail: reject,
            quality:
              quality >= 0.8 ? "high" : quality >= 0.4 ? "normal" : "low",
            success: resolve,
          })
      );
      const info = await getImageInfo({ src: photo.tempImagePath });
      const capture: CameraPhoto = {
        height: info.height,
        type: "photo",
        uri: photo.tempImagePath,
        width: info.width,
      };
      if (latest.current.pictureOptions?.base64) {
        capture.base64 = await new Promise<string>((resolve, reject) =>
          getFileSystemManager().readFile({
            encoding: "base64",
            fail: reject,
            filePath: photo.tempImagePath,
            success: (result) => resolve(String(result.data)),
          })
        );
      }
      if (!alive.current) {
        return null;
      }
      latest.current.onCapture?.(capture);
      return capture;
    } catch (error_) {
      error(error_);
      return null;
    } finally {
      busy.current = false;
      if (alive.current) {
        setCapturing(false);
      }
    }
  };
  const startRecording = async () => {
    if (
      !ready ||
      paused ||
      busy.current ||
      starting.current ||
      since.current !== null ||
      !permission?.granted
    ) {
      return;
    }
    if (latest.current.mute || latest.current.mirror) {
      error("Camera: silent or mirrored recording is unavailable in WeChat.");
      return;
    }
    cancelCountdown();
    const revision = ++recordRevision.current;
    starting.current = true;
    try {
      await authorize({ scope: "scope.record" });
      if (!alive.current || revision !== recordRevision.current) {
        starting.current = false;
        return;
      }
      return await new Promise<CameraVideo | undefined>((resolve) => {
        recordingDone.current = resolve;
        native.startRecord({
          fail: (e) => {
            if (revision === recordRevision.current) failVideo(e);
            else {
              starting.current = false;
              resolve(undefined);
            }
          },
          success: () => {
            starting.current = false;
            if (!alive.current || revision !== recordRevision.current) {
              native.stopRecord({
                success: () => resolve(undefined),
                fail: () => resolve(undefined),
              });
              return;
            }
            since.current = Date.now();
            if (!alive.current) {
              native.stopRecord({ success: finishVideo, fail: failVideo });
              return;
            }
            setRecordingSince(since.current);
            if (latest.current.maxDuration && latest.current.maxDuration > 0)
              cap.current = setTimeout(
                stopRecording,
                Math.min(latest.current.maxDuration, 30) * 1000
              );
          },
          timeoutCallback: (result) => {
            if (revision === recordRevision.current) finishVideo(result);
          },
        });
      });
    } catch (error_) {
      failVideo(error_);
    }
  };
  const flip = () => {
    if (starting.current || since.current !== null || busy.current) {
      return;
    }
    cancelCountdown();
    setFacing(facing === "back" ? "front" : "back");
    changeZoom(0);
    if (props.haptics !== false) {
      void selectionTick();
    }
  };
  const setZoom = (value: number) => changeZoom(clampZoom(value));
  const setMode = (value: typeof mode) => {
    if (!starting.current && since.current === null && !busy.current) {
      cancelCountdown();
      changeMode(value);
    }
  };
  const press = () => {
    if (countdown !== null) {
      cancelCountdown();
      return;
    }
    if (mode === "video") {
      if (since.current === null) {
        void startRecording();
      } else {
        stopRecording();
      }
      return;
    }
    if (!ready || busy.current) {
      return;
    }
    if (timer === 0) {
      void takePhoto();
      return;
    }
    let remaining = timer;
    setCountdown(remaining);
    clock.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        cancelCountdown();
        void takePhoto();
      } else if (alive.current) {
        setCountdown(remaining);
      }
    }, 1000);
  };
  useEffect(() => {
    alive.current = true;
    readPermission();
    return () => {
      alive.current = false;
      recordRevision.current += 1;
      recordingDone.current?.();
      recordingDone.current = undefined;
      clearInterval(clock.current);
      clearTimeout(cap.current);
      if (since.current !== null) {
        native.stopRecord({ success: finishVideo, fail: failVideo });
      }
    };
  }, []);
  useEffect(() => {
    if (ready && permission?.granted) {
      native.setZoom({
        zoom: 1 + clampZoom(zoom) * (maxZoom - 1),
        fail: error,
      });
    }
  }, [zoom, maxZoom, ready, permission?.granted]);
  useEffect(() => {
    if (previousFacing.current === facing) {
      return;
    }
    previousFacing.current = facing;
    cancelCountdown();
    stopRecording();
    setReady(false);
  }, [facing]);
  const view: CameraViewHandle = {
    pausePreview: async () => {
      stopRecording();
      setPaused(true);
      setReady(false);
    },
    recordAsync: async () => {
      const video = await startRecording();
      return video ? { uri: video.uri } : undefined;
    },
    resumePreview: async () => {
      setPaused(false);
    },
    stopRecording,
    takePictureAsync: async () => (await takePhoto()) ?? undefined,
  };
  return {
    cancelCountdown,
    capturing,
    countdown,
    error,
    facing,
    flash,
    flip,
    haptics: props.haptics !== false,
    id,
    initialize: (maximum) => {
      setMaxZoom(Number.isFinite(maximum) ? Math.max(1, maximum) : 1);
      setReady(true);
    },
    maxDuration: props.maxDuration,
    maxZoom,
    mode,
    paused,
    permission,
    press,
    props,
    ready,
    recording: recordingSince !== null,
    recordingSince,
    requestPermission,
    setFlash,
    setMode,
    setReady,
    setTimer,
    setZoom,
    startRecording: async () => {
      await startRecording();
    },
    stopRecording,
    takePhoto,
    timer,
    view,
    zoom: clampZoom(zoom),
  };
};
