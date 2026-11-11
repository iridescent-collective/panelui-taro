import { authorize, getRecorderManager } from "@tarojs/taro";
export interface Recording {
  path: string;
  seconds: number;
}
export interface RecorderObserver {
  start: () => void;
  stop: (recording: Recording) => void;
  error: (message: string) => void;
}
let manager: ReturnType<typeof getRecorderManager> | undefined;
let owner: RecorderObserver | undefined;
let stopping = false;
function getManager() {
  if (manager) return manager;
  const recorder = getRecorderManager();
  recorder.onStart(() => {
    if (owner && !stopping) owner.start();
    else if (stopping) recorder.stop();
  });
  recorder.onStop((result) => {
    const observer = owner;
    owner = undefined;
    stopping = false;
    observer?.stop({
      path: result.tempFilePath,
      seconds: result.duration / 1000,
    });
  });
  recorder.onError(() => {
    const observer = owner;
    owner = undefined;
    stopping = false;
    observer?.error(
      "Recording failed. Check microphone permission and try again."
    );
  });
  recorder.onPause(() => {
    if (owner) recorder.stop();
  });
  recorder.onInterruptionBegin(() => {
    if (owner) recorder.stop();
  });
  manager = recorder;
  return recorder;
}
/** The WeChat recorder is global. Register native callbacks once and release its owner. */
export function createRecorder(observer: RecorderObserver) {
  let disposed = false;
  let pending = false;
  return {
    async start() {
      if (pending || disposed || owner === observer) return;
      pending = true;
      try {
        await authorize({ scope: "scope.record" });
        if (disposed) return;
        if (owner || stopping)
          throw new Error("The microphone is already in use.");
        const recorder = getManager();
        owner = observer;
        recorder.start({
          duration: 60000,
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 48000,
          format: "mp3",
        });
      } catch (error) {
        if (owner === observer) owner = undefined;
        if (!disposed)
          observer.error(
            error instanceof Error
              ? error.message
              : "Microphone permission was denied. Enable recording in WeChat settings."
          );
      } finally {
        pending = false;
      }
    },
    stop() {
      if (owner === observer) manager?.stop();
    },
    dispose() {
      disposed = true;
      if (owner === observer) {
        owner = undefined;
        stopping = true;
        manager?.stop();
      }
    },
  };
}
